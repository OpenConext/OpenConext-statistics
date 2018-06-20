from server.test.abstract_test import AbstractTest


class TestStats(AbstractTest):

    def test_service_providers(self):
        json = self.get("service_providers")
        self.assertEqual(5, len(json))

    def test_identity_providers(self):
        json = self.get("identity_providers")
        self.assertEqual(3, len(json))

    def test_first_login(self):
        json = self.get("first_login")
        self.assertEqual("2016-03-29T05:20:19Z", json)

    def test_last_login(self):
        json = self.get("last_login")
        self.assertEqual("2018-05-24T08:53:07Z", json)

    def test_login_time_frame_group_by_year_no_uniques(self):
        json = self.get("login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "year",
                                    "include_unique": "false"})
        self.assertListEqual([{"count_user_id": 11, "time": "2016"}, {"count_user_id": 14, "time": "2017"},
                              {"count_user_id": 5, "time": "2018"}], json)

    def test_login_time_frame_group_by_year_without_to(self):
        json = self.get("login_time_frame",
                        query_data={"from": "2014-01-01","scale": "year",
                                    "include_unique": "false"})
        self.assertListEqual([{"count_user_id": 11, "time": "2016"}, {"count_user_id": 14, "time": "2017"},
                              {"count_user_id": 5, "time": "2018"}], json)

    def test_login_time_frame_group_by_quarter(self):
        json = self.get("login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "quarter"})
        # 4 quarter in 2016, 2017 and two in 2018 => 10 quarters * 2 for including unique ones
        self.assertListEqual([{"count_user_id": 1, "time": "2016Q1"}, {"count_user_id": 2, "time": "2016Q2"},
                              {"count_user_id": 2, "time": "2016Q3"}, {"count_user_id": 6, "time": "2016Q4"},
                              {"count_user_id": 2, "time": "2017Q1"}, {"count_user_id": 4, "time": "2017Q2"},
                              {"count_user_id": 6, "time": "2017Q3"}, {"count_user_id": 2, "time": "2017Q4"},
                              {"count_user_id": 4, "time": "2018Q1"}, {"count_user_id": 1, "time": "2018Q2"},
                              {"distinct_count_user_id": 1, "time": "2016Q1"},
                              {"distinct_count_user_id": 2, "time": "2016Q2"},
                              {"distinct_count_user_id": 2, "time": "2016Q3"},
                              {"distinct_count_user_id": 6, "time": "2016Q4"},
                              {"distinct_count_user_id": 2, "time": "2017Q1"},
                              {"distinct_count_user_id": 4, "time": "2017Q2"},
                              {"distinct_count_user_id": 6, "time": "2017Q3"},
                              {"distinct_count_user_id": 2, "time": "2017Q4"},
                              {"distinct_count_user_id": 4, "time": "2018Q1"},
                              {"distinct_count_user_id": 1, "time": "2018Q2"}], json)
        self.assertEqual(20, len(json))
        self.assertEqual(2 * 30, sum(
            map(lambda p: p["count_user_id"] if "count_user_id" in p else p["distinct_count_user_id"], json)))

    def test_login_time_frame_group_by_month(self):
        json = self.get("login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "month",
                                    "include_unique": "false"})
        self.assertListEqual([{"count_user_id": 1, "time": "2016M3"}, {"count_user_id": 1, "time": "2016M4"},
                              {"count_user_id": 1, "time": "2016M5"}, {"count_user_id": 1, "time": "2016M7"},
                              {"count_user_id": 1, "time": "2016M8"}, {"count_user_id": 2, "time": "2016M10"},
                              {"count_user_id": 2, "time": "2016M11"}, {"count_user_id": 2, "time": "2016M12"},
                              {"count_user_id": 1, "time": "2017M2"}, {"count_user_id": 1, "time": "2017M3"},
                              {"count_user_id": 2, "time": "2017M4"}, {"count_user_id": 1, "time": "2017M5"},
                              {"count_user_id": 1, "time": "2017M6"}, {"count_user_id": 1, "time": "2017M7"},
                              {"count_user_id": 1, "time": "2017M8"}, {"count_user_id": 4, "time": "2017M9"},
                              {"count_user_id": 2, "time": "2017M10"}, {"count_user_id": 1, "time": "2018M1"},
                              {"count_user_id": 3, "time": "2018M3"}, {"count_user_id": 1, "time": "2018M5"}], json)
        self.assertEqual(30, sum(map(lambda p: p["count_user_id"], json)))

    def test_login_period_by_year(self):
        json = self.get("login_period", query_data={"period": "2018"})
        self.assertListEqual([{'sum_count_user_id': 5, 'time': '2018'},
                              {'sum_distinct_count_user_id': 5, 'time': '2018'}], json)

    def test_login_period_by_month(self):
        json = self.get("login_period", query_data={"period": "2017M9"})
        self.assertListEqual([{'sum_count_user_id': 4, 'time': '2017M9'},
                             {'sum_distinct_count_user_id': 4, 'time': '2017M9'}], json)

    def test_login_period_by_month_no_results(self):
        json = self.get("login_period", query_data={"period": "2222M9"})
        self.assertListEqual([], json)