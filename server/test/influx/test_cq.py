from server.test.abstract_test import AbstractTest


class TestCq(AbstractTest):

    def test_cq_unauthorized(self):
        response = self.client.put(f"/api/stats/admin/reinitialize_measurements_and_cq",
                                   headers={"Authorization": "Basic ZGFzaGJvYXJkOnNlY3JldA=="})
        self.assertEqual(401, response.status_code)

    def test_cq(self):
        self.client.put(f"/api/stats/admin/reinitialize_measurements_and_cq",
                        headers={"Authorization": "Basic c3lzYWRtaW46c2VjcmV0"})
        measurements_count = len(list(self.app.influx_client.get_list_measurements()))
        self.assertEqual((24 * len(["week", "month", "quarter", "year"])) + 12 * len(["day"]) + 1,
                         measurements_count)
