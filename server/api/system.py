import time
import datetime
import random
import time

from flask import Blueprint, current_app
from werkzeug.exceptions import Unauthorized

from server.api.base import json_endpoint
from server.manage.manage import service_providers, identity_providers

system_api = Blueprint("system_api", __name__, url_prefix="/api/system")


@system_api.route("/generate", strict_slashes=False, methods=["PUT"])
@json_endpoint
def generate():
    config = current_app.app_config
    if config.profile != "local":
        raise Unauthorized(description=f"Generate not allowed in non-local mode")

    db = current_app.influx_client

    db_name = config.database.name
    db.switch_database(db_name)

    sp_entities = list(map(lambda p: p["id"], service_providers()))
    idp_entities = list(map(lambda p: p["id"], identity_providers()))
    states = ["prodaccepted", "testaccepted"]

    points = []
    for n in range(10_000):
        timestamp = time.time()
        rd = datetime.datetime.utcfromtimestamp(timestamp)
        points.append({
            "measurement": "eb_logins_tst",
            "tags": {
                "sp_entity_id": random.choice(sp_entities),
                "idp_entity_id": random.choice(idp_entities),
                "state": random.choice(states),
                "year": str(rd.year),
                "quarter": str(((rd.month - 1) // 3) + 1),
                "month": rd.strftime("%m")
            },
            "fields": {
                "user_id": f"user_{n % 50}"
            },
            "time": (round(timestamp) - n) * 1_000_000_000
        })

    db.write_points(points)

    return {}, 201
