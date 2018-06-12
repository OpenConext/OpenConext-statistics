from flask import Blueprint, current_app

from server.api.base import json_endpoint
from server.influx.repo import min_time, max_time, service_providers, identity_providers

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

@stats_api.route("/logins", strict_slashes=False)
@json_endpoint
def logins();


# add state="prodaccepted"
# scale=minute, day, week, month, year
# period => day, week, month, quarter, year
def nbr_login(from_seconds, to_seconds, idp_entity_id=None, sp_entity_id=None, scale="day"):
    measurement = f"{'sp_' if sp_entity_id else ''}{'idp_' if idp_entity_id else ''}" \
                  f"{'total_' if not idp_entity_id and not sp_entity_id}users_{scale}"
    q = f"select * from {measurement} where "
    q += ""
    if from_seconds:
        from_date = datetime.strptime(from_date, "%Y-%m-%d")

    return _query()
