import datetime
import logging
import os
import sys

import yaml
from flask import Flask, jsonify, request as current_request
from influxdb import InfluxDBClient
from munch import munchify

from server.api.base import base_api
from server.api.stats import stats_api
from server.api.system import system_api
from server.api.user import user_api
from server.influx.cq import backfill_login_measurements


def read_file(file_name):
    file = f"{os.path.dirname(os.path.realpath(__file__))}/{file_name}"
    with open(file) as f:
        return f.read()


def _init_logging():
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('STATISTICS: %(asctime)s %(name)s %(levelname)s %(message)s')
    handler.setFormatter(formatter)
    root.addHandler(handler)


def page_not_found(_):
    return jsonify({"message": f"{current_request.base_url} not found"}), 404


config_file_location = os.environ.get("CONFIG", "config/config.yml")
config = munchify(yaml.load(read_file(config_file_location), Loader=yaml.FullLoader))

test = os.environ.get("TEST")
profile = os.environ.get("PROFILE")

is_local = profile is not None and profile == "local"
is_test = test is not None and bool(int(test))

_init_logging()

logger = logging.getLogger("main")
logger.info(f"Initialize server with profile {profile}")

app = Flask(__name__)
app.secret_key = config.secret_key

app.config["SESSION_COOKIE_SECURE"] = not (is_test or is_local)

app.register_blueprint(base_api)
app.register_blueprint(stats_api)
app.register_blueprint(user_api)
app.register_blueprint(system_api)

app.register_error_handler(404, page_not_found)

db_name = config.database.name
app.influx_client = InfluxDBClient(host=config.database.host,
                                   port=config.database.port,
                                   username=config.database.username,
                                   password=config.database.password,
                                   database=db_name,
                                   timeout=60 * 60,
                                   retries=5)
app.app_config = config
app.app_config["profile"] = profile

app.influx_client.switch_database(db_name)
result_set = app.influx_client.query("show continuous queries")
series = list(filter(lambda s: s["name"] == db_name,
                     result_set.raw["series"] if "series" in result_set.raw else []))

if is_test and (len(series) == 0 or "values" not in series[0] or len(series[0]["values"]) < 15):
    now = datetime.datetime.now()
    logger.info(f"start back-filling {now}")
    backfill_login_measurements(config, app.influx_client)
    logger.info(f"ended back-filling {datetime.datetime.now() - now}")

# WSGI production mode dictates that no flask app is actually running
if is_local:
    app.run(port=8080, debug=False, host="0.0.0.0", threaded=True)
