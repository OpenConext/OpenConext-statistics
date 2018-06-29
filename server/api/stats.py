import datetime
import re

from dateutil import tz
from flask import Blueprint, current_app, request

from server.api.base import json_endpoint
from server.influx.repo import min_time, max_time, service_providers, identity_providers, login_by_time_frame, \
    login_by_time_period

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
def service_provider_tags():
    return list(map(lambda p: {"id": p, "name": p}, service_providers(current_app.app_config.log.sp_id))), 200


@stats_api.route("/identity_providers", strict_slashes=False)
@json_endpoint
def identity_provider_tags():
    return list(map(lambda p: {"id": p, "name": p}, identity_providers(current_app.app_config.log.idp_id))), 200


def _options():
    args = request.args
    log = current_app.app_config.log
    valid_group_by = ["idp_id", "sp_id"]
    group_by = args.get("group_by", default="").split(",")
    return {
        "idp_entity_id": args.get("idp_entity_id"),
        "sp_entity_id": args.get("sp_entity_id"),
        "include_unique": "true" == args.get("include_unique", default="true").lower(),
        "group_by": list(
            map(lambda s: log[s], filter(lambda s: s in valid_group_by, map(lambda s: s.strip(), group_by))))
    }


def _parse_date(key):
    date = request.args.get(key)
    if date:
        res = re.match(r"(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$", date)
        if res:
            return int(datetime.datetime(*(map(int, res.groups())), tzinfo=tz.tzutc()).timestamp())
    return date


@stats_api.route("/login_time_frame", strict_slashes=False)
@json_endpoint
def login_time_frame():
    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    scale = request.args.get("scale", default="day")

    results = login_by_time_frame(current_app.app_config, scale=scale, from_seconds=from_arg, to_seconds=to_arg,
                                  **_options())
    return results if len(results) > 0 else ["no_results"], 200


@stats_api.route("/login_period", strict_slashes=False)
@json_endpoint
def login_time_period():
    period = request.args.get("period", "")
    if period and not re.match(period_regex, period, re.IGNORECASE):
        raise ValueError(f"Invalid period {period}. Must match {period_regex}")
    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    if not period and (not from_arg or not to_arg):
        raise ValueError("Must either specify period or from and to")

    results = login_by_time_period(current_app.app_config, period, **_options(), from_s=from_arg, to_s=to_arg)
    return results if len(results) > 0 else ["no_results"], 200
