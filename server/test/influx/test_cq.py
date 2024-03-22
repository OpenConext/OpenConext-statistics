from server.test.abstract_test import AbstractTest
from base64 import b64encode

BASIC_AUTH_HEADER = {"Authorization": f"Basic {b64encode(b'sysadmin:secret').decode('ascii')}"}


class TestCq(AbstractTest):

    def test_cq_unauthorized(self):
        response = self.client.put("/api/stats/admin/reinitialize_measurements_and_cq",
                                   headers={"Authorization": "Basic ZGFzaGJvYXJkOnNlY3JldA=="})
        self.assertEqual(401, response.status_code)

    def test_cq(self):
        self.client.put("/api/stats/admin/reinitialize_measurements_and_cq",
                        headers=BASIC_AUTH_HEADER)
        self._assert_measurements()

        self.client.put("/api/stats/admin/restart_reinitialize_measurements_and_cq",
                        headers=BASIC_AUTH_HEADER)
        self._assert_measurements()

    def _assert_measurements(self):
        measurements_count = len(list(self.app.influx_client.get_list_measurements()))
        self.assertEqual((24 * len(["week", "month", "quarter", "year"])) + 12 * len(["day"]) + 1,
                         measurements_count)

    def test_unique_week_cq(self):
        self.client.put("/api/stats/admin/reinitialize_unique_week_cq",
                        headers=BASIC_AUTH_HEADER)
        self._assert_measurements()
