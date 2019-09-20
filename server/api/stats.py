import datetime
import logging
import os
import re
import threading

from dateutil import tz
from flask import Blueprint, current_app, request as current_request, session, g as request_context
from werkzeug.exceptions import Unauthorized

from server.api.base import json_endpoint
from server.influx.cq import backfill_login_measurements, reinitialize_unique_week_cq
from server.influx.repo import login_by_time_frame, \
    service_providers_tags, identity_providers_tags, login_by_aggregated, first_login_from_to, last_login_providers, \
    database_stats, login_count_per_idp_sp
from server.influx.time import start_end_period
from server.manage.manage import service_providers, connected_identity_providers, identity_providers
from random import *

VALID_GROUP_BY = ["idp_id", "sp_id"]
VALID_STATE = ["prodaccepted", "testaccepted"]
VALID_PROVIDER = ["sp", "idp"]
VALID_PERIOD_SCALE = ["month", "quarter", "week", "day"]

stats_api = Blueprint("stats_api", __name__, url_prefix="/api/stats")
period_regex = r"\d{4}[QMWD]{0,1}\d{0,3}$"


@stats_api.route("/first_login_time", strict_slashes=False)
@json_endpoint
def first_login_time():
    args = current_request.args
    period = args.get("period")
    if period and not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")

    from_arg = _parse_date("from", required=not period, message="Must either specify period or from and to")
    to_arg = _parse_date("to")

    p = start_end_period(period) if period else (from_arg, to_arg)
    from_seconds, to_seconds = p

    request_args = {
        "from_seconds": from_seconds,
        "to_seconds": to_seconds
    }
    provider = args.get("provider")
    if provider and provider in VALID_PROVIDER:
        request_args["provider"] = provider
    else:
        raise ValueError(f"Must specify provider: {VALID_PROVIDER}")

    first_logins = first_login_from_to(current_app.app_config, **request_args)

    manage_providers = service_providers() if provider == "sp" else identity_providers()
    manage_providers_entity_ids = list(map(lambda p: p["id"], manage_providers))

    # Filter out all of the results that are not present in Manage
    prop = "sp_entity_id" if provider == "sp" else "idp_entity_id"

    result = list(filter(lambda p: p[prop] in manage_providers_entity_ids, first_logins))
    return result, 200


@stats_api.route("/last_login_time", strict_slashes=False)
@json_endpoint
def last_login_time():
    args = current_request.args
    from_arg = _parse_date("from", required=True)

    request_args = {}
    provider = args.get("provider")
    if provider and provider in VALID_PROVIDER:
        request_args["provider"] = provider
    else:
        raise ValueError(f"Must specify provider: {VALID_PROVIDER}")

    last_logins = last_login_providers(current_app.app_config, **request_args)

    ft = int(from_arg) * 1000
    # All logins before from
    last_logins_before_from = list(filter(lambda p: p["time"] < ft, last_logins))

    manage_providers = service_providers() if provider == "sp" else identity_providers()
    manage_providers_entity_ids = list(map(lambda p: p["id"], manage_providers))

    # Filter out all of the results that are not present in Manage
    prop = "sp_entity_id" if provider == "sp" else "idp_entity_id"

    result = list(filter(lambda p: p[prop] in manage_providers_entity_ids, last_logins_before_from))
    return result, 200


def _add_manage_metadata(value, provider):
    languages = list(map(lambda s: s.strip(), current_app.app_config.supported_language_codes.split(",")))
    result = provider if provider else {"id": value, "state": None, "present_in_manage": False}
    if not provider:
        for lang in languages:
            result[f"name_{lang}"] = value
    return result


@stats_api.route("/database_stats", strict_slashes=False)
@json_endpoint
def meta_data():
    return database_stats(), 200


@stats_api.route("/admin/reinitialize_measurements_and_cq", strict_slashes=False, methods=["PUT"])
@json_endpoint
def reinitialize_measurements_and_cq():
    if os.environ.get("TEST"):
        _do_reinitialize_measurements_and_cq(current_app, False)
    else:
        thread = threading.Thread(target=_do_reinitialize_measurements_and_cq,
                                  args=(current_app._get_current_object(), False))
        thread.start()
    return {"result": "Reinitialize_measurements_and_cq is started. Check the log files for progress"}, 200


@stats_api.route("/admin/restart_reinitialize_measurements_and_cq", strict_slashes=False, methods=["PUT"])
@json_endpoint
def restart_reinitialize_measurements_and_cq():
    if os.environ.get("TEST"):
        _do_reinitialize_measurements_and_cq(current_app, True)
    else:
        thread = threading.Thread(target=_do_reinitialize_measurements_and_cq,
                                  args=(current_app._get_current_object(), True))
        thread.start()
    return {"result": "Restart reinitialize_measurements_and_cq is started. Check the log files for progress"}, 200


@stats_api.route("/admin/reinitialize_unique_week_cq", strict_slashes=False, methods=["PUT"])
@json_endpoint
def reinitialize_unique_week_cq_endpoint():
    if os.environ.get("TEST"):
        _do_reinitialize_unique_week_cq(current_app)
    else:
        thread = threading.Thread(target=_do_reinitialize_unique_week_cq,
                                  args=([current_app._get_current_object()]))
        thread.start()
    return {"result": "Reinitialize_unique_week_cq is started. Check the log files for progress"}, 200


def _do_reinitialize_measurements_and_cq(local_app_instance, is_restart=False):
    with local_app_instance.app_context():
        cfg = local_app_instance.app_config
        influx_client = local_app_instance.influx_client
        backfill_login_measurements(cfg, influx_client, is_restart=is_restart)
        logger = logging.getLogger("stats")
        action = "initializing" if not is_restart else "restarting"
        logger.info(f"Successfully finished {action} backfills and cq's")


def _do_reinitialize_unique_week_cq(local_app_instance):
    with local_app_instance.app_context():
        cfg = local_app_instance.app_config
        influx_client = local_app_instance.influx_client
        reinitialize_unique_week_cq(cfg, influx_client)
        logger = logging.getLogger("stats")
        logger.info(f"Successfully finished back-filling the unique weeks measurements")


@stats_api.route("/service_providers", strict_slashes=False)
@json_endpoint
def service_provider_data():
    sp_manage = service_providers()
    sp_influx = service_providers_tags(current_app.app_config.log.measurement, current_app.app_config.log.sp_id)
    sp_manage_dict = {sp["id"]: sp for sp in sp_manage}
    result = list(
        map(lambda sp_id: _add_manage_metadata(sp_id, sp_manage_dict[sp_id] if sp_id in sp_manage_dict else None),
            sp_influx))
    return result, 200


@stats_api.route("/identity_providers", strict_slashes=False)
@json_endpoint
def identity_providers_data():
    idp_manage = identity_providers()
    idp_influx = identity_providers_tags(current_app.app_config.log.measurement, current_app.app_config.log.idp_id)
    idp_manage_dict = {idp["id"]: idp for idp in idp_manage}
    result = list(map(lambda idp: _add_manage_metadata(idp, idp_manage_dict[idp] if idp in idp_manage_dict else None),
                      idp_influx))
    return result, 200


@stats_api.route("/public/connected_identity_providers", strict_slashes=False)
@json_endpoint
def identity_provider_data():
    return connected_identity_providers(), 200


def _options(include_group_by=True, include_unique=True,
             blacklisted_args=["idp_entity_id", "sp_entity_id", "group_by"]):
    args = current_request.args
    log = current_app.app_config.log
    request_args = {"idp_entity_id": args.get("idp_id"),
                    "sp_entity_id": args.get("sp_id"),
                    "epoch": args.get("epoch")
                    }
    if include_group_by:
        group_by = args.get("group_by", default="").split(",")
        request_args["group_by"] = list(map(lambda s: log[s],
                                            filter(lambda s: s in VALID_GROUP_BY, map(lambda s: s.strip(), group_by))))
    if include_unique:
        request_args["include_unique"] = "true" == args.get("include_unique", default="true").lower()
    group_by_period = args.get("group_by_period")
    if group_by_period:
        if group_by_period not in VALID_PERIOD_SCALE:
            raise ValueError(f"Invalid group_by_period {group_by_period}. Must be on off {VALID_PERIOD_SCALE}")
        request_args["group_by_period"] = group_by_period

        if "group_by" not in request_args or len(request_args["group_by"]) is not 2:
            raise ValueError(f"Group_by_period {group_by_period} must be combined with 2 group_by arg")

    state = args.get("state")
    if state and state in VALID_STATE:
        request_args["state"] = state

    institution_type = args.get("institution_type")
    if institution_type:
        request_args["institution_type"] = institution_type

    is_authorized_api_call = request_context.get("is_authorized_api_call", False)

    if not (("user" in session and not session["user"]["guest"]) or is_authorized_api_call):
        for a in blacklisted_args:
            if request_args.get(a):
                raise Unauthorized(description="Forbidden")

    return request_args


def _parse_date(key, required=False, message=None):
    date = current_request.args.get(key)
    if date:
        res = re.match(r"(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$", date)
        if res:
            date = datetime.datetime(*(map(int, res.groups())), tzinfo=tz.tzutc())
    else:
        if required:
            raise ValueError(message if message else f"{key} is required.")
        date = datetime.datetime.utcnow()
    if isinstance(date, datetime.datetime):
        return int(date.timestamp())
    return int(date)


@stats_api.route("/public/login_time_frame", strict_slashes=False)
@json_endpoint
def login_time_frame():
    from_seconds = _parse_date("from", required=True)
    to_seconds = _parse_date("to")
    scale = current_request.args.get("scale", default="day")

    results = login_by_time_frame(current_app.app_config, from_seconds, to_seconds, scale=scale,
                                  **_options(False))
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/public/unique_login_count", strict_slashes=False)
@json_endpoint
def unique_login_count():
    from_seconds = _parse_date("from", required=True)
    to_seconds = _parse_date("to")

    results = login_count_per_idp_sp(current_app.app_config, from_seconds, to_seconds, **_options(False, False))
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/public/login_aggregated", strict_slashes=False)
@json_endpoint
def login_aggregated():
    period = current_request.args.get("period", "")
    if not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")

    results = login_by_aggregated(current_app.app_config, period, **_options())
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/public/login_animated", strict_slashes=False)
@json_endpoint
def login_animated():
    return [{"name": f"name {i}", "value": randint(1, 100)} for i in range(15)], 200
