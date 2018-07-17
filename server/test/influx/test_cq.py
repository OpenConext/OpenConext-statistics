from server.test.abstract_test import AbstractTest


class CqBase(AbstractTest):

    def force_init_database(self):
        return True

    def test_cq(self):
        measurements_count = len(list(self.app.influx_client.get_list_measurements()))
        self.assertEqual((24 * len(["hour", "day", "week", "month", "quarter", "year"])) + 12 * len(["minute"]) + 1,
                         measurements_count)
