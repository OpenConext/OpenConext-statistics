import requests
from flask_testing import TestCase


class AbstractTest(TestCase):

    def create_app(self):
        from server.__main__ import main
        app = main()
        return app

    def get(self, url, query_data={}, response_status_code=200):
        with requests.Session() as s:
            response = self.client.get(f"/api/stats/{url}",
                                       headers={"Authorization": "Basic ZGFzaGJvYXJkOnNlY3JldA=="},
                                       query_string=query_data)
            self.assertEqual(response_status_code, response.status_code)
            s.close()
