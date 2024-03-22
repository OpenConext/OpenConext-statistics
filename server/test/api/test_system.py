from server.test.abstract_test import AbstractTest


class TestUser(AbstractTest):

    def test_generate(self):
        pass
        # config = self.app.app_config
        # config["profile"] = "local"
        # config["manage"]["mock"] = True
        # response = self.client.put("/api/system/generate")
        # self.assertEqual(201, response.status_code)
        #
        # result_set = self.app.influx_client.query("select count(*) from eb_logins_tst")
        #
        # res = list(result_set.get_points())
        # self.assertTrue(res[0]["count_user_id"] > 10)
        #
        # config["profile"] = None
        # config["manage"]["mock"] = False
