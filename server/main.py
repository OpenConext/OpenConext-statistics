import logging
import os
from logging.handlers import TimedRotatingFileHandler

import flask
import yaml
from flask import Flask
from influxdb import InfluxDBClient
from munch import munchify
from werkzeug.exceptions import Unauthorized

from server.api.base import base_api
from server.api.stats import stats_api


def read_file(file_name):
    file = f"{os.path.dirname(os.path.realpath(__file__))}/{file_name}"
    with open(file) as f:
        return f.read()


def _init_logging():
    formatter = logging.Formatter('%(asctime)s %(name)s %(levelname)s %(message)s')
    handler = TimedRotatingFileHandler(f"{os.path.dirname(os.path.realpath(__file__))}/../log/stats.log",
                                       when="midnight", backupCount=15)
    handler.setFormatter(formatter)
    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def main():
    _init_logging()
    config = munchify(yaml.load(read_file("config/config.yml")))

    app = Flask(__name__)
    app.register_blueprint(stats_api)
    app.register_blueprint(base_api)

    app.influx_client = InfluxDBClient(host=config.database.host,
                                       port=config.database.port,
                                       username=config.database.username,
                                       password=config.database.password,
                                       database=config.database.name)
    app.influx_config = config
    profile = os.environ.get("PROFILE")
    if profile is not None and profile == "local":
        app.run(port=8080, debug=False, host="0.0.0.0", threaded=True)


if __name__ == "__main__":
    main()
