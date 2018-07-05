import datetime

from dateutil import tz
from flask import current_app
from urllib3_mock import Responses

from server.test.abstract_test import AbstractTest

responses = Responses("requests.packages.urllib3")


class TestStats(AbstractTest):

    def _assert_datetime_equals(self, milliseconds, date_str):
        dt = datetime.datetime.fromtimestamp(milliseconds / 1000, tz=tz.tzutc())
        self.assertEqual(date_str, dt.strftime("%Y-%m-%dT%H:%M:%SZ"))

    def mock_manage(self, type):
        responses.add("POST", f"/manage/api/internal/search/saml20_{type}",
                      body=AbstractTest.read_file(f"mock/manage_metadata_{type}.json"), status=200,
                      content_type="application/json")

    def mock_influx(self, type):
        responses.add("GET", "/query",
                      body=AbstractTest.read_file(f"mock/influx_tag_values_{type}.json"), status=200,
                      content_type="application/json")

    @responses.activate
    def test_service_providers(self):
        self.mock_manage("sp")
        self.mock_influx("sp")
        json = self.get("service_providers")
        self.assertListEqual([{'id': 'https://sp/1', 'name_en': 'SP1-en', 'name_nl': 'SP1-nl', 'state': 'prodaccepted'},
                              {'id': 'https://sp/2', 'name_en': 'SP2-en', 'name_nl': 'SP2-nl', 'state': 'testaccepted'},
                              {'id': 'https://sp/3', 'name_en': 'SP3-en', 'name_nl': 'SP3-nl', 'state': 'prodaccepted'},
                              {'id': 'https://sp/4', 'name_en': 'https://sp/4', 'name_nl': 'https://sp/4',
                               'state': None},
                              {'id': 'https://sp/5', 'name_en': 'https://sp/5', 'name_nl': 'https://sp/5',
                               'state': None}], json)

    @responses.activate
    def test_identity_providers(self):
        self.mock_manage("idp")
        self.mock_influx("idp")
        json = self.get("identity_providers")
        self.assertListEqual(
            [{'id': 'https://idp/1', 'name_en': 'IDP1-en', 'name_nl': 'IDP1-nl', 'state': 'prodaccepted'},
             {'id': 'https://idp/2', 'name_en': 'IDP2-en', 'name_nl': 'IDP2-nl', 'state': 'testaccepted'},
             {'id': 'https://idp/3', 'name_en': 'https://idp/3', 'name_nl': 'https://idp/3', 'state': None}], json)

    @responses.activate
    def test_connected_identity_providers(self):
        self.mock_manage("idp")
        json = self.get("public/connected_identity_providers")
        self.assertListEqual([{'coin:institution_type': 'HBO', 'coin:publish_in_edugain': '1', 'id': 'https://idp/1',
                               'name_en': 'IDP1-en', 'name_nl': 'IDP1-nl', 'state': 'prodaccepted'},
                              {'coin:guest_qualifier': 'None', 'id': 'https://idp/2', 'name_en': 'IDP2-en',
                               'name_nl': 'IDP2-nl', 'state': 'testaccepted'}], json)

    def test_identity_providers_local(self):
        current_app.app_config["profile"] = "local"
        json = self.get("identity_providers")
        self.assertEqual(3, len(json))

    def test_service_providers_local(self):
        current_app.app_config["profile"] = "local"
        json = self.get("service_providers")
        self.assertEqual(5, len(json))

    def test_first_login(self):
        json = self.get("first_login")
        self.assertEqual("2016-03-29T05:20:19Z", json)

    def test_last_login(self):
        json = self.get("last_login")
        self.assertEqual("2018-05-24T08:53:07Z", json)

    def test_login_time_frame_group_by_year_no_uniques(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "year",
                                    "include_unique": "false"})
        self.assertListEqual([{"count_user_id": 11, "time": "2016"}, {"count_user_id": 14, "time": "2017"},
                              {"count_user_id": 5, "time": "2018"}], json)

    def test_login_time_frame_group_by_year_without_to(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "scale": "year",
                                    "include_unique": "false"})
        self.assertListEqual([{"count_user_id": 11, "time": "2016"}, {"count_user_id": 14, "time": "2017"},
                              {"count_user_id": 5, "time": "2018"}], json)

    def test_login_time_frame_group_by_year_without_to_ms(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "scale": "year",
                                    "include_unique": "false", "epoch": "ms"})
        self.assertListEqual(
            [{'count_user_id': 11, 'time': 1451606400000}, {'count_user_id': 14, 'time': 1483228800000},
             {'count_user_id': 5, 'time': 1514764800000}], json)

    def test_login_time_frame_group_by_quarter_ms(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2016-10-01", "to": "2017-01-01", "scale": "quarter", "epoch": "ms"})
        self.assertListEqual(
            [{'count_user_id': 6, 'time': 1475280000000}, {'distinct_count_user_id': 6, 'time': 1475280000000}],
            json)
        self._assert_datetime_equals(json[0]["time"], "2016-10-01T00:00:00Z")

    def test_login_time_frame_group_by_quarter(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "quarter"})
        # 4 quarter in 2016, 2017 and two in 2018 => 10 quarters * 2 for including unique ones
        self.assertListEqual(
            [{"count_user_id": 1, "time": "2016Q1"}, {"count_user_id": 2, "time": "2016Q2"},
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

    def test_login_time_frame_group_by_month_ms(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2017-10-15", "to": "2017-11-16", "scale": "month", "epoch": "ms"})

        self.assertListEqual([{'count_user_id': 2, 'time': 1506816000000},
                              {'distinct_count_user_id': 2, 'time': 1506816000000}], json)
        self._assert_datetime_equals(json[0]["time"], "2017-10-01T00:00:00Z")

    def test_login_time_frame_group_by_month(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "month",
                                    "include_unique": "false"})
        self.assertListEqual(
            [{"count_user_id": 1, "time": "2016M3"}, {"count_user_id": 1, "time": "2016M4"},
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

    def test_login_time_frame_group_by_quarter_and_sp(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2016-08-01", "to": "2017-05-20", "scale": "quarter",
                                    "group_by": "idp_id", "include_unique": "false"})
        self.assertListEqual(
            [{'count_user_id': 1, 'idp_entity_id': 'https://idp/1', 'time': '2016Q3'},
             {'count_user_id': 3, 'idp_entity_id': 'https://idp/1', 'time': '2016Q4'},
             {'count_user_id': 1, 'idp_entity_id': 'https://idp/1', 'time': '2017Q1'},
             {'count_user_id': 1, 'idp_entity_id': 'https://idp/1', 'time': '2017Q2'},
             {'count_user_id': 2, 'idp_entity_id': 'https://idp/2', 'time': '2016Q4'},
             {'count_user_id': 1, 'idp_entity_id': 'https://idp/2', 'time': '2017Q1'},
             {'count_user_id': 1, 'idp_entity_id': 'https://idp/3', 'time': '2016Q4'},
             {'count_user_id': 2, 'idp_entity_id': 'https://idp/3', 'time': '2017Q2'}], json)

    def test_login_time_frame_group_by_quarter_and_sp_idp(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2017-01-01", "to": "2017-03-31", "scale": "quarter",
                                    "group_by": " idp_id, sp_id , bogus", "include_unique": "false"})
        self.assertListEqual(
            [{'count_user_id': 1, 'idp_entity_id': 'https://idp/1', 'sp_entity_id': 'https://sp/5',
              'time': '2017Q1'},
             {'count_user_id': 1, 'idp_entity_id': 'https://idp/2', 'sp_entity_id': 'https://sp/4',
              'time': '2017Q1'}],
            json)

    def test_login_period_by_year(self):
        json = self.get("public/login_period", query_data={"period": "2018"})
        self.assertListEqual([{"sum_count_user_id": 5, "time": "2018"},
                              {"sum_distinct_count_user_id": 5, "time": "2018"}], json)

    def test_login_period_by_month(self):
        json = self.get("public/login_period", query_data={"period": "2017M9"})
        self.assertListEqual([{"sum_count_user_id": 4, "time": "2017M9"},
                              {"sum_distinct_count_user_id": 4, "time": "2017M9"}], json)

    def test_login_period_by_month_ms(self):
        json = self.get("public/login_period", query_data={"period": "2017M9", "epoch": "ms"})
        self.assertListEqual([{'sum_count_user_id': 4, 'time': 1504224000000},
                              {'sum_distinct_count_user_id': 4, 'time': 1504224000000}], json)
        self._assert_datetime_equals(json[0]["time"], "2017-09-01T00:00:00Z")

    def test_login_period_by_month_no_results(self):
        json = self.get("public/login_period", query_data={"period": "2222M9"})
        self.assertListEqual(["no_results"], json)

    def test_login_period_year_group_by_idp(self):
        json = self.get("public/login_period",
                        query_data={"period": "2017", "sp_id": "https://sp/1", "group_by": "idp_id"})
        self.assertListEqual([{"idp_entity_id": "https://idp/1", "sum_count_user_id": 1, "time": "2017"},
                              {"idp_entity_id": "https://idp/2", "sum_count_user_id": 1, "time": "2017"},
                              {"idp_entity_id": "https://idp/1", "sum_distinct_count_user_id": 1, "time": "2017"},
                              {"idp_entity_id": "https://idp/2", "sum_distinct_count_user_id": 1, "time": "2017"}],
                             json)

    def test_login_period_year_group_by_sp(self):
        json = self.get("public/login_period",
                        query_data={"period": "2017", "idp_id": "https://idp/1", "group_by": "sp_id"})
        self.assertListEqual([{"sp_entity_id": "https://sp/1", "sum_count_user_id": 1, "time": "2017"},
                              {"sp_entity_id": "https://sp/2", "sum_count_user_id": 2, "time": "2017"},
                              {"sp_entity_id": "https://sp/3", "sum_count_user_id": 2, "time": "2017"},
                              {"sp_entity_id": "https://sp/4", "sum_count_user_id": 1, "time": "2017"},
                              {"sp_entity_id": "https://sp/5", "sum_count_user_id": 1, "time": "2017"},
                              {"sp_entity_id": "https://sp/1", "sum_distinct_count_user_id": 1, "time": "2017"},
                              {"sp_entity_id": "https://sp/2", "sum_distinct_count_user_id": 2, "time": "2017"},
                              {"sp_entity_id": "https://sp/3", "sum_distinct_count_user_id": 2, "time": "2017"},
                              {"sp_entity_id": "https://sp/4", "sum_distinct_count_user_id": 1, "time": "2017"},
                              {"sp_entity_id": "https://sp/5", "sum_distinct_count_user_id": 1, "time": "2017"}],
                             json)

    def test_login_period_year_group_by_sp_and_idp(self):
        json = self.get("public/login_period",
                        query_data={"period": "2017", "idp_id": "https://idp/1",
                                    "sp_id": "https://sp/1", "group_by": "sp_id,idp_id"})
        self.assertListEqual(
            [{'idp_entity_id': 'https://idp/1', 'sp_entity_id': 'https://sp/1', 'sum_count_user_id': 1,
              'time': '2017'},
             {'idp_entity_id': 'https://idp/1', 'sp_entity_id': 'https://sp/1', 'sum_distinct_count_user_id': 1,
              'time': '2017'}], json)

    def test_login_period_year_401(self):
        for forbidden_arg in ["idp_id", "sp_id", "group_by"]:
            query_string = {"period": "2017", forbidden_arg: "idp_id"}
            response = self.client.get(f"/api/stats/public/login_period",
                                       query_string=query_string)
            self.assertEqual(401, response.status_code)
        response = self.client.get(f"/api/stats/public/login_period",
                                   query_string={"period": "2017"})
        self.assertEqual(200, response.status_code)

    def test_login_period_invalid(self):
        self.get("public/login_period", response_status_code=500)

    def test_login_period_from_to(self):
        json = self.get("public/login_period", query_data={"from": "2017-01-01", "to": "2018-01-01"})
        self.assertListEqual([{'sum_count_user_id': 14, 'time': '2017-01-01T00:00:00Z'},
                              {'sum_distinct_count_user_id': 14, 'time': '2017-01-01T00:00:00Z'}], json)

    def test_login_period_from_to_simple_date(self):
        json = self.get("public/login_period", query_data={"from": "2017-1-1", "to": "2018-1-1"})
        self.assertListEqual([{'sum_count_user_id': 14, 'time': '2017-01-01T00:00:00Z'},
                              {'sum_distinct_count_user_id': 14, 'time': '2017-01-01T00:00:00Z'}], json)

    def test_login_period_test_accepted(self):
        json = self.get("public/login_period",
                        query_data={"from": "2017-1-1", "to": "2018-1-1", "state": "testaccepted"})
        self.assertListEqual([{'sum_count_user_id': 6, 'time': '2017-01-01T00:00:00Z'},
                              {'sum_distinct_count_user_id': 6, 'time': '2017-01-01T00:00:00Z'}], json)

    def test_login_period_prod_accepted(self):
        json = self.get("public/login_period",
                        query_data={"from": "2017-1-1", "to": "2018-1-1", "state": "prodaccepted"})
        self.assertListEqual([{'sum_count_user_id': 8, 'time': '2017-01-01T00:00:00Z'},
                              {'sum_distinct_count_user_id': 8, 'time': '2017-01-01T00:00:00Z'}], json)

    def test_login_period_from_to_seconds(self):
        json = self.get("public/login_period", query_data={"from": "1483228800", "to": "1514764800"})
        self.assertListEqual([{'sum_count_user_id': 14, 'time': '2017-01-01T00:00:00Z'},
                              {'sum_distinct_count_user_id': 14, 'time': '2017-01-01T00:00:00Z'}], json)
