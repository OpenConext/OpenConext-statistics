import os

import requests
from flask_testing import TestCase


class AbstractTest(TestCase):

    def create_app(self):
        from server.__main__ import main
        os.environ["TEST"] = "1"
        app = main("config/test_config.yml")
        app.app_config.test = True
        return app

    def get(self, url, query_data={}, response_status_code=200, api="stats"):
        with requests.Session():
            response = self.client.get(f"/api/{api}/{url}",
                                       headers={"Authorization": "Basic ZGFzaGJvYXJkOnNlY3JldA=="},
                                       query_string=query_data)
            self.assertEqual(response_status_code, response.status_code, msg=str(response.json))
            return response.json

    @staticmethod
    def read_file(path):
        file = f"{os.path.dirname(os.path.realpath(__file__))}/{path}"
        with open(file) as f:
            return f.read()
