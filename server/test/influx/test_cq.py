import json
import os

import yaml
from influxdb import InfluxDBClient
from munch import munchify

from server.__main__ import read_file
from server.test.abstract_test import AbstractTest


class CqBase(AbstractTest):

    def create_app(self):
        config = munchify(yaml.load(read_file("config/test_config.yml")))
        db_name = config.database.name
        influx_client = InfluxDBClient(host=config.database.host,
                                       port=config.database.port,
                                       username=config.database.username,
                                       password=config.database.password,
                                       database=db_name)
        influx_client.drop_database(db_name)
        influx_client.create_database(db_name)
        influx_client.switch_database(db_name)
        file = f"{os.path.dirname(os.path.realpath(__file__))}/../seed/seed.json"
        with open(file) as f:
            json_body = json.loads(f.read())
            influx_client.write_points(json_body)

        return super(CqBase, self).create_app()

    def test_cq(self):
        measurements_count = len(list(self.app.influx_client.get_list_measurements()))
        self.assertEqual((28 * 3) + 1, measurements_count)
