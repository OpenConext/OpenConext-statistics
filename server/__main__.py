import logging
import os
from logging.handlers import TimedRotatingFileHandler

import yaml
from flask import Flask, jsonify, request as current_request
from influxdb import InfluxDBClient
from munch import munchify

from server.api.base import base_api
from server.api.stats import stats_api
from server.influx.cq import backfill_login_measurements


def read_file(file_name):
    file = f"{os.path.dirname(os.path.realpath(__file__))}/{file_name}"
    with open(file) as f:
        return f.read()


def _init_logging(is_local):
    formatter = logging.Formatter('%(asctime)s %(name)s %(levelname)s %(message)s')
    logger = logging.getLogger()
    if not is_local:
        handler = TimedRotatingFileHandler(f"{os.path.dirname(os.path.realpath(__file__))}/../log/stats.log",
                                           when="midnight", backupCount=15)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)


def page_not_found(_):
    return jsonify({"message": f"{current_request.base_url} not found"}), 404


def main(config_file_location="config/config.yml"):
    config = munchify(yaml.load(read_file(config_file_location)))

    app = Flask(__name__)
    app.register_blueprint(stats_api)
    app.register_blueprint(base_api)
    app.register_error_handler(404, page_not_found)

    app.influx_client = InfluxDBClient(host=config.database.host,
                                       port=config.database.port,
                                       username=config.database.username,
                                       password=config.database.password,
                                       database=config.database.name)
    app.influx_config = config

    app.influx_client.switch_database(config.database.name)
    measurements_count = len(list(app.influx_client.get_list_measurements()))
    if measurements_count < 29:
        backfill_login_measurements(config, app.influx_client)

    profile = os.environ.get("PROFILE")

    is_local = profile is not None and profile == "local"
    _init_logging(is_local)
    if is_local:
        app.run(port=8080, debug=False, host="0.0.0.0", threaded=True)
    else:
        return app


if __name__ == "__main__":
    main()
