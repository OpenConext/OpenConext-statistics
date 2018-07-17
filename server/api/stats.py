import datetime
import re

from dateutil import tz
from flask import Blueprint, current_app, request as current_request, session, g as request_context
from werkzeug.exceptions import Unauthorized

from server.api.base import json_endpoint
from server.influx.cq import backfill_login_measurements
from server.influx.repo import login_by_time_frame, \
    service_providers_tags, identity_providers_tags, login_by_aggregated, first_login_from_to, last_login_providers, \
    database_stats, drop_measurements_and_cq
from server.influx.time import start_end_period
from server.manage.manage import service_providers, connected_identity_providers, identity_providers

VALID_GROUP_BY = ["idp_id", "sp_id"]
VALID_STATE = ["prodaccepted", "testaccepted"]
VALID_PROVIDER = ["sp", "idp"]

stats_api = Blueprint("stats_api", __name__, url_prefix="/api/stats")
period_regex = r"\d{4}[QMWD]{0,1}\d{0,3}$"


@stats_api.route("/first_login_time", strict_slashes=False)
@json_endpoint
def first_login_time():
    args = current_request.args
    period = args.get("period", "")
    if period and not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")
    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    if not period and (not from_arg or not to_arg):
        raise ValueError("Must either specify period or from and to")

    p = start_end_period(period) if period else (from_arg, to_arg)
    from_seconds, to_seconds = p

    request_args = {
        "from_seconds": from_seconds,
        "to_seconds": to_seconds
    }
    state = args.get("state")
    if state and state in VALID_STATE:
        request_args["state"] = state

    provider = args.get("provider")
    if provider and provider in VALID_PROVIDER:
        request_args["provider"] = provider
    else:
        raise ValueError(f"Must specify provider: {VALID_PROVIDER}")

    return first_login_from_to(current_app.app_config, **request_args), 200


@stats_api.route("/last_login_time", strict_slashes=False)
@json_endpoint
def last_login_time():
    args = current_request.args
    from_arg = _parse_date("from")
    if not from_arg:
        raise ValueError("Must specify from")

    request_args = {}
    state = args.get("state")
    if state and state in VALID_STATE:
        request_args["state"] = state

    provider = args.get("provider")
    if provider and provider in VALID_PROVIDER:
        request_args["provider"] = provider
    else:
        raise ValueError(f"Must specify provider: {VALID_PROVIDER}")

    last_logins = last_login_providers(current_app.app_config, **request_args)
    entity_ids = list(map(lambda p: p["sp_entity_id"] if provider == "sp" else p["idp_entity_id"], last_logins))
    manage_providers = [] if current_app.app_config.profile == "local" else service_providers() \
        if provider == "sp" else identity_providers()

    manage_providers = list(
        filter(lambda p: p["id"] not in entity_ids and (state == "all" or p["state"] == state), manage_providers))
    ft = int(from_arg) * 1000
    last_logins_before_from = list(filter(lambda p: p["time"] < ft, last_logins))

    return manage_providers + last_logins_before_from, 200


def _add_manage_metadata(value, provider):
    return provider if provider else {"id": value, "state": None, "name_en": "Name EN: " + value,
                                      "name_nl": "Name NL: " + value}


@stats_api.route("/database_stats", strict_slashes=False)
@json_endpoint
def meta_data():
    return database_stats(), 200


@stats_api.route("/admin/reinitialize_measurements_and_cq", strict_slashes=False, methods=["DELETE"])
@json_endpoint
def drop_measurements():
    cfg = current_app.app_config
    drop_measurements_and_cq(cfg.log.measurement, cfg.database.name)
    backfill_login_measurements(cfg, current_app.influx_client)
    return [], 201


@stats_api.route("/service_providers", strict_slashes=False)
@json_endpoint
def service_provider_data():
    sp_manage = [] if current_app.app_config.profile == "local" else service_providers()
    sp_influx = service_providers_tags(current_app.app_config.log.measurement, current_app.app_config.log.sp_id)
    sp_manage_dict = {sp["id"]: sp for sp in sp_manage}
    return list(
        map(lambda sp_id: _add_manage_metadata(sp_id, sp_manage_dict[sp_id] if sp_id in sp_manage_dict else None),
            sp_influx)), 200


@stats_api.route("/identity_providers", strict_slashes=False)
@json_endpoint
def identity_providers_data():
    idp_manage = [] if current_app.app_config.profile == "local" else identity_providers()
    idp_influx = identity_providers_tags(current_app.app_config.log.measurement, current_app.app_config.log.idp_id)
    idp_manage_dict = {idp["id"]: idp for idp in idp_manage}
    return list(map(lambda idp: _add_manage_metadata(idp, idp_manage_dict[idp] if idp in idp_manage_dict else {}),
                    idp_influx)), 200


@stats_api.route("/public/connected_identity_providers", strict_slashes=False)
@json_endpoint
def identity_provider_data():
    return connected_identity_providers(), 200


def _options(include_group_by=True, blacklisted_args=["idp_entity_id", "sp_entity_id", "group_by"]):
    args = current_request.args
    log = current_app.app_config.log
    request_args = {"idp_entity_id": args.get("idp_id"),
                    "sp_entity_id": args.get("sp_id"),
                    "include_unique": "true" == args.get("include_unique", default="true").lower(),
                    "epoch": args.get("epoch")
                    }
    if include_group_by:
        group_by = args.get("group_by", default="").split(",")
        request_args["group_by"] = list(map(lambda s: log[s],
                                            filter(lambda s: s in VALID_GROUP_BY, map(lambda s: s.strip(), group_by))))
    state = args.get("state")
    if state and state in VALID_STATE:
        request_args["state"] = state

    is_authorized_api_call = request_context.get("is_authorized_api_call", False)

    if not ("user" in session or is_authorized_api_call):
        for a in blacklisted_args:
            if request_args.get(a):
                raise Unauthorized(description="Forbidden")

    return request_args


def _parse_date(key, required=False):
    date = current_request.args.get(key)
    if date:
        res = re.match(r"(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$", date)
        if res:
            date = datetime.datetime(*(map(int, res.groups())), tzinfo=tz.tzutc())
    else:
        if required:
            raise ValueError(f"{key} is required.")
        date = datetime.datetime.utcnow()
    return int(date.timestamp()) if isinstance(date, datetime.datetime) else int(date)


@stats_api.route("/public/login_time_frame", strict_slashes=False)
@json_endpoint
def login_time_frame():
    from_seconds = _parse_date("from", required=True)
    to_seconds = _parse_date("to")
    scale = current_request.args.get("scale", default="day")

    results = login_by_time_frame(current_app.app_config, from_seconds, to_seconds, scale=scale,
                                  **_options(False))
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/public/login_aggregated", strict_slashes=False)
@json_endpoint
def login_aggregated():
    period = current_request.args.get("period", "")
    if not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")

    results = login_by_aggregated(current_app.app_config, period, **_options())
    return results if len(results) > 0 else ["no_results"], 200
