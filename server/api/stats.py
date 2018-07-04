import datetime
import re

from dateutil import tz
from flask import Blueprint, current_app, request as current_request, session, g as request_context
from werkzeug.exceptions import Unauthorized

from server.api.base import json_endpoint
from server.influx.repo import min_time, max_time, login_by_time_frame, \
    login_by_time_period, service_providers_tags, identity_providers_tags
from server.manage.manage import service_providers, connected_identity_providers, identity_providers

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


@stats_api.route("/service_providers", strict_slashes=False)
@json_endpoint
def service_provider_data():
    return (service_providers_tags(current_app.app_config.log.measurement, current_app.app_config.log.sp_id), 200) \
        if current_app.app_config.profile == "local" else (service_providers(), 200)


@stats_api.route("/identity_providers", strict_slashes=False)
@json_endpoint
def identity_providers_data():
    return (identity_providers_tags(current_app.app_config.log.measurement, current_app.app_config.log.idp_id), 200) \
        if current_app.app_config.profile == "local" else (identity_providers(), 200)


@stats_api.route("/public/connected_identity_providers", strict_slashes=False)
@json_endpoint
def identity_provider_data():
    return connected_identity_providers(), 200


def _options(blacklisted_args=["idp_entity_id", "sp_entity_id", "group_by"]):
    args = current_request.args
    log = current_app.app_config.log
    valid_group_by = ["idp_id", "sp_id"]
    group_by = args.get("group_by", default="").split(",")
    request_args = {"idp_entity_id": args.get("idp_id"),
                    "sp_entity_id": args.get("sp_id"),
                    "include_unique": "true" == args.get("include_unique", default="true").lower(),
                    "group_by": list(map(lambda s: log[s],
                                         filter(lambda s: s in valid_group_by, map(lambda s: s.strip(), group_by)))),
                    "epoch": args.get("epoch")}
    is_authorized_api_call = request_context.get("is_authorized_api_call", False)

    if not("user" in session or is_authorized_api_call):
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
                                  **_options())
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/public/login_period", strict_slashes=False)
@json_endpoint
def login_time_period():
    period = current_request.args.get("period", "")
    if period and not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")
    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    if not period and (not from_arg or not to_arg):
        raise ValueError("Must either specify period or from and to")

    results = login_by_time_period(current_app.app_config, period, **_options(), from_s=from_arg, to_s=to_arg)
    return results if len(results) > 0 else ["no_results"], 200
