import datetime
import re

from dateutil import tz
from flask import Blueprint, current_app, request as current_request, session, g as request_context
from werkzeug.exceptions import Unauthorized

from server.api.base import json_endpoint
from server.influx.repo import min_time, max_time, login_by_time_frame, \
    service_providers_tags, identity_providers_tags, login_by_aggregated
from server.manage.manage import service_providers, connected_identity_providers, identity_providers

VALID_GROUP_BY = ["idp_id", "sp_id"]
VALID_STATE = ["prodaccepted", "testaccepted"]

stats_api = Blueprint("stats_api", __name__, url_prefix="/api/stats")
period_regex = r"\d{4}[QMWD]{0,1}\d{0,3}$"


@stats_api.route("/first_login", strict_slashes=False)
@json_endpoint
def first_login():
    return min_time(current_app.app_config.log.measurement, current_app.app_config.log.user_id), 200


@stats_api.route("/last_login", strict_slashes=False)
@json_endpoint
def last_login():
    return max_time(current_app.app_config.log.measurement, current_app.app_config.log.user_id), 200


def _add_manage_metadata(value, provider):
    return provider if provider else {"id": value, "state": None, "name_en": "Name EN: " + value,
                                      "name_nl": "Name NL: " + value}


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


def _parse_date(key):
    date = current_request.args.get(key)
    if date:
        res = re.match(r"(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$", date)
        if res:
            return int(datetime.datetime(*(map(int, res.groups())), tzinfo=tz.tzutc()).timestamp())
    return date


@stats_api.route("/public/login_time_frame", strict_slashes=False)
@json_endpoint
def login_time_frame():
    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    scale = current_request.args.get("scale", default="day")

    results = login_by_time_frame(current_app.app_config, scale=scale, from_seconds=from_arg, to_seconds=to_arg,
                                  **_options(False))
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/public/login_aggregated", strict_slashes=False)
@json_endpoint
def login_aggregated():
    period = current_request.args.get("period", "")
    if period and not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")
    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    if not period and (not from_arg or not to_arg):
        raise ValueError("Must either specify period or from and to")

    results = login_by_aggregated(current_app.app_config, period, **_options(), from_s=from_arg, to_s=to_arg)
    return results if len(results) > 0 else ["no_results"], 200
