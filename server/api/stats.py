import datetime
import re

from flask import Blueprint, current_app, request

from server.api.base import json_endpoint
from server.influx.repo import min_time, max_time, service_providers, identity_providers, login_by_time_frame, \
    login_by_time_period

stats_api = Blueprint("stats_api", __name__, url_prefix="/api/stats")


@stats_api.route("/first_login", strict_slashes=False)
@json_endpoint
def first_login():
    return min_time(current_app.influx_config.log.measurement, current_app.influx_config.log.user_id), 200


@stats_api.route("/last_login", strict_slashes=False)
@json_endpoint
def last_login():
    return max_time(current_app.influx_config.log.measurement, current_app.influx_config.log.user_id), 200


@stats_api.route("/service_providers", strict_slashes=False)
@json_endpoint
def service_provider_tags():
    return service_providers(current_app.influx_config.log.sp_id), 200


@stats_api.route("/identity_providers", strict_slashes=False)
@json_endpoint
def identity_provider_tags():
    return identity_providers(current_app.influx_config.log.idp_id), 200


def _options():
    args = request.args
    return {
        "idp_entity_id": args.get("idp_entity_id"),
        "sp_entity_id": args.get("sp_entity_id"),
        "include_unique": args.get("include_unique", default=True)
    }


@stats_api.route("/login_time_frame", strict_slashes=False)
@json_endpoint
def login_time_frame():
    def _parse_date(key):
        date = request.args.get(key)
        if date:
            res = re.match("(\d{4})[/.-](\d{2})[/.-](\d{4})$", date)
            if res:
                return int(datetime.datetime(*(map(int, res.groups()))).timestamp())
        return date

    from_arg = _parse_date("from")
    to_arg = _parse_date("to")
    scale = request.args.get("scale", default="day")

    return login_by_time_frame(current_app.influx_config, scale, from_arg, to_arg, **_options()), 200


@stats_api.route("/login_period", strict_slashes=False)
@json_endpoint
def login_time_period():
    period = request.args.get("period")

    return login_by_time_period(current_app.influx_config, period, **_options()), 200
