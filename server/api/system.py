import json
import logging
import os

from flask import Blueprint, request as current_request, session, current_app
from werkzeug.exceptions import Unauthorized

from server.api.base import json_endpoint
from server.manage.manage import service_providers, identity_providers

system_api = Blueprint("system_api", __name__, url_prefix="/api/system")


@system_api.route("/generate", strict_slashes=False)
@json_endpoint
def generate():
    config = current_app.app_config
    if config.profile != "local":
        raise Unauthorized(description=f"No write access for user")

    db = current_app.influx_client

    databases = list(map(lambda p: p["name"], db.get_list_database()))
    db_name = config.database.name
    db.switch_database(db_name)

    sp_entities = list(map(lambda p: p["id"], service_providers()))
    idp_entities = list(map(lambda p: p["id"], identity_providers()))

    points = []

    for n in range(10000):
        points.append({

        })

    db.write_points(points)

    return {}, 200

