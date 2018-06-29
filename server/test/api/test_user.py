from flask import current_app

from server.test.abstract_test import AbstractTest


class TestUser(AbstractTest):

    def test_me_401(self):
        response = self.client.get(f"/api/users/me")
        self.assertEqual(401, response.status_code)

    def test_me_local(self):
        current_app.app_config["profile"] = "local"
        response = self.client.get(f"/api/users/me")
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json["guest"], False)

    def test_me_shib(self):
        response = self.client.get(f"/api/users/me", headers={"name-id": "uid"})
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json["guest"], False)
        self.assertEqual(response.json["uid"], "uid")

