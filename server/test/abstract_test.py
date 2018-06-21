import json
import os

import requests
from flask_testing import TestCase

from server.influx.cq import backfill_login_measurements


class AbstractTest(TestCase):

    def setUp(self):
        db_name = self.app.influx_config.database.name
        influx_client = self.app.influx_client
        if len(list(filter(lambda m: m["name"] == db_name, influx_client.get_list_database()))) == 0:
            influx_client.drop_database(db_name)
            influx_client.create_database(db_name)
            influx_client.switch_database(db_name)
            file = f"{os.path.dirname(os.path.realpath(__file__))}/seed/seed.json"
            with open(file) as f:
                json_body = json.loads(f.read())
                influx_client.write_points(json_body)
            backfill_login_measurements(self.app.influx_config, influx_client)

    def create_app(self):
        from server.__main__ import main
        os.environ["TEST"] = "1"
        app = main("config/test_config.yml")
        return app

    def get(self, url, query_data={}, response_status_code=200):
        with requests.Session():
            response = self.client.get(f"/api/stats/{url}",
                                       headers={"Authorization": "Basic ZGFzaGJvYXJkOnNlY3JldA=="},
                                       query_string=query_data)
            self.assertEqual(response_status_code, response.status_code, msg=str(response.json))
            return response.json
