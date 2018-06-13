from flask import Blueprint, current_app, request

from server.api.base import json_endpoint
from server.influx.repo import min_time, max_time, service_providers, identity_providers, login_by_time_frame

stats_api = Blueprint("stats_api", __name__, url_prefix="/api/stats")


@stats_api.route("/first_login", strict_slashes=False)
@json_endpoint
def first_login():
    return min_time(current_app.influx_config.log.measurement,
                    current_app.influx_config.log.user_id), 200


@stats_api.route("/last_login", strict_slashes=False)
@json_endpoint
def last_login():
    return max_time(current_app.influx_config.log.measurement,
                    current_app.influx_config.log.user_id), 200


@stats_api.route("/service_providers", strict_slashes=False)
@json_endpoint
def service_provider_tags():
    return service_providers(current_app.influx_config.log.sp_id), 200


@stats_api.route("/identity_providers", strict_slashes=False)
@json_endpoint
def identity_provider_tags():
    return identity_providers(current_app.influx_config.log.idp_id), 200


@stats_api.route("/login_time_frame", strict_slashes=False)
@json_endpoint
def login_time_frame():
    from_arg = request.args.get("from")
    to_arg = request.args.get("to")
    idp_entity_id = request.args.get("idp_entity_id")
    sp_entity_id = request.args.get("sp_entity_id")
    scale = request.args.get("scale", default="day")
    include_unique = request.args.get("include_unique", default=True)
    return login_by_time_frame(current_app.influx_config, from_arg, to_arg, idp_entity_id, sp_entity_id, scale,
                               include_unique), 200
