import datetime
import json

import responses
from dateutil import tz
from flask import current_app

from server.test.abstract_test import AbstractTest


class TestStats(AbstractTest):

    def _assert_datetime_equals(self, milliseconds, date_str):
        dt = datetime.datetime.fromtimestamp(milliseconds / 1000, tz=tz.tzutc())
        self.assertEqual(date_str, dt.strftime("%Y-%m-%dT%H:%M:%SZ"))

    def mock_manage(self, type=None, file=None):
        responses.add_passthru("http://localhost:8086")
        url = f"https://manage.example.surfconext.nl/manage/api/internal/search/{type}"
        responses.add(responses.POST, url,
                      json=json.loads(AbstractTest.read_file(file if file else f"mock/manage_metadata_{type}.json")),
                      status=200)
        if type == "saml20_sp":
            url = "https://manage.example.surfconext.nl/manage/api/internal/search/oidc10_rp"
            responses.add(responses.POST, url,
                          json=json.loads(
                              AbstractTest.read_file(file if file else "mock/manage_metadata_oidc10_rp.json")),
                          status=200)

    @responses.activate
    def test_service_providers(self):
        self.mock_manage(type="saml20_sp")
        json = self.get("service_providers")
        self.assertListEqual([{"id": "https://sp/1",
                               "manage_id": "2cc71508-1b68-4a3e-b553-f04b6b2a689c",
                               "name_en": "SP1-en",
                               "name_nl": "SP1-nl",
                               "name_pt": "https://sp/1",
                               "present_in_manage": True,
                               "state": "prodaccepted"},
                              {"id": "https://sp/2",
                               "manage_id": "c9002374-7e5a-4c82-bb36-8c6ae47ed745",
                               "name_en": "SP2-en",
                               "name_nl": "SP2-nl",
                               "name_pt": "https://sp/2",
                               "present_in_manage": True,
                               "state": "testaccepted"},
                              {"id": "https://sp/3",
                               "manage_id": "d4e7de27-c9af-4f80-8d1f-c0832225fa8c",
                               "name_en": "SP3-en",
                               "name_nl": "SP3-nl",
                               "name_pt": "SP3-pt",
                               "present_in_manage": True,
                               "state": "prodaccepted"},
                              {"id": "https://sp/4",
                               "name_en": "https://sp/4",
                               "name_nl": "https://sp/4",
                               "name_pt": "https://sp/4",
                               "present_in_manage": False,
                               "state": None},
                              {"id": "https://sp/5",
                               "name_en": "https://sp/5",
                               "name_nl": "https://sp/5",
                               "name_pt": "https://sp/5",
                               "present_in_manage": False,
                               "state": None}], json)

    @responses.activate
    def test_identity_providers(self):
        self.mock_manage(type="saml20_idp")
        json = self.get("identity_providers")
        self.assertListEqual(
            [{"coin:institution_type": "HBO",
              "id": "https://idp/1",
              "manage_id": "2cc71508-1b68-4a3e-b553-f04b6b2a689c",
              "name_en": "IDP1-en",
              "name_nl": "IDP1-nl",
              "name_pt": "https://idp/1",
              "present_in_manage": True,
              "state": "prodaccepted"},
             {"id": "https://idp/2",
              "manage_id": "c9002374-7e5a-4c82-bb36-8c6ae47ed745",
              "name_en": "IDP2-en",
              "name_nl": "IDP2-nl",
              "name_pt": "https://idp/2",
              "present_in_manage": True,
              "state": "testaccepted"},
             {"id": "https://idp/3",
              "name_en": "https://idp/3",
              "name_nl": "https://idp/3",
              "name_pt": "https://idp/3",
              "present_in_manage": False,
              "state": None}], json)

    @responses.activate
    def test_connected_identity_providers(self):
        self.mock_manage(type="saml20_idp")
        json = self.get("public/connected_identity_providers")
        self.assertListEqual([{"coin:institution_type": "HBO",
                               "coin:publish_in_edugain": "1",
                               "id": "https://idp/1",
                               "manage_id": "2cc71508-1b68-4a3e-b553-f04b6b2a689c",
                               "name_en": "IDP1-en",
                               "name_nl": "IDP1-nl",
                               "name_pt": "https://idp/1",
                               "present_in_manage": True,
                               "state": "prodaccepted"},
                              {"coin:guest_qualifier": "None",
                               "id": "https://idp/2",
                               "manage_id": "c9002374-7e5a-4c82-bb36-8c6ae47ed745",
                               "name_en": "IDP2-en",
                               "name_nl": "IDP2-nl",
                               "name_pt": "https://idp/2",
                               "present_in_manage": True,
                               "state": "testaccepted"}], json)

    def test_identity_providers_local(self):
        current_app.app_config["manage"]["mock"] = True
        json = self.get("identity_providers")
        self.assertEqual(3, len(json))

    def test_service_providers_local(self):
        current_app.app_config["manage"]["mock"] = True
        json = self.get("service_providers")
        self.assertEqual(5, len(json))

    @responses.activate
    def test_first_login_period(self):
        self.mock_manage(type="saml20_idp")
        json = self.get("first_login_time", query_data={"period": "2016M5", "provider": "idp"})
        self.assertListEqual([{"count_user_id": 1, "distinct_count_user_id": 1, "idp_entity_id": "https://idp/1",
                               "month": "05", "quarter": "2", "time": 1463356800000, "year": "2016"}], json)

    @responses.activate
    def test_first_login_period_with_state(self):
        self.mock_manage(type="saml20_idp")
        json = self.get("first_login_time", query_data={"period": "2016M5", "provider": "idp", "state": "prodaccepted"})
        self.assertEqual(0, len(json))

    def test_first_login_invalid_period(self):
        self.get("first_login_time", query_data={"period": "bogus"}, response_status_code=500)

    def test_first_login_no_period_and_to(self):
        self.get("first_login_time", query_data={"from": "2016-08-14"}, response_status_code=500)

    def test_first_login_invalid_provider(self):
        self.get("first_login_time", query_data={"period": "2016M5", "provider": "bogus"}, response_status_code=500)

    @responses.activate
    def test_last_login_time(self):
        self.mock_manage(type="saml20_sp")
        json = self.get("last_login_time", query_data={"from": "2018-01-01", "state": "prodaccepted", "provider": "sp"})
        self.assertListEqual([{'count_user_id': 1, 'distinct_count_user_id': 1, 'month': '10', 'quarter': '4',
                               'sp_entity_id': 'https://sp/1', 'time': 1509235200000, 'year': '2017'}], json)

    def test_last_login_invalid_from(self):
        self.get("last_login_time", query_data={}, response_status_code=500)

    def test_last_login_invalid_provider(self):
        self.get("last_login_time", query_data={"period": "2016M1", "from": "2016-08-16", "provider": "bogus"},
                 response_status_code=500)

    def test_database_stats(self):
        res = self.get("database_stats")
        expected = json.loads(AbstractTest.read_file("seed/counts_after_seed.json"))
        self.assertListEqual(expected, res)

    def test_login_time_frame_group_by_year_no_uniques(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "year",
                                    "include_unique": "false"})

        self.assertListEqual([{"count_user_id": 11, "time": "2016-01-01T00:00:00Z"},
                              {"count_user_id": 14, "time": "2017-01-01T00:00:00Z"},
                              {"count_user_id": 5, "time": "2018-01-01T00:00:00Z"}], json)

    def test_login_time_frame_group_by_year_without_to(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "scale": "year",
                                    "include_unique": "false"})

        self.assertListEqual([{"count_user_id": 11, "time": "2016-01-01T00:00:00Z"},
                              {"count_user_id": 14, "time": "2017-01-01T00:00:00Z"},
                              {"count_user_id": 5, "time": "2018-01-01T00:00:00Z"}], json)

    def test_login_time_frame_group_by_year_without_to_ms(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "scale": "year",
                                    "include_unique": "false", "epoch": "ms"})

        self.assertListEqual(
            [{"count_user_id": 11, "time": 1451606400000},
             {"count_user_id": 14, "time": 1483228800000},
             {"count_user_id": 5, "time": 1514764800000}], json)
        self._assert_datetime_equals(json[0]["time"], "2016-01-01T00:00:00Z")
        self._assert_datetime_equals(json[1]["time"], "2017-01-01T00:00:00Z")
        self._assert_datetime_equals(json[2]["time"], "2018-01-01T00:00:00Z")

    def test_login_time_frame_group_by_quarter_ms(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2016-10-01", "to": "2017-01-01", "scale": "quarter", "epoch": "ms"})

        self.assertListEqual(
            [{"count_user_id": 6, "time": 1475280000000},
             {"distinct_count_user_id": 5, "time": 1475280000000}],
            json)
        for p in json:
            self._assert_datetime_equals(p["time"], "2016-10-01T00:00:00Z")

    def test_login_time_frame_group_by_day_multiple_distincts(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2016-08-01", "to": "2016-08-10", "scale": "day"})
        expected = [{"count_user_id": 1, "distinct_count_user_id": 1, "time": "2016-08-09T00:00:00Z"}]
        self.assertListEqual(expected, json)

    def test_login_time_frame_group_by_quarter(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "quarter"})
        # 4 quarter in 2016, 2017 and two in 2018 => 10 quarters * 2 for including unique ones
        self.assertListEqual(
            [{"count_user_id": 1, "time": "2016-01-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2016-04-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2016-07-01T00:00:00Z"},
             {"count_user_id": 6, "time": "2016-10-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2017-01-01T00:00:00Z"},
             {"count_user_id": 4, "time": "2017-04-01T00:00:00Z"},
             {"count_user_id": 6, "time": "2017-07-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2017-10-01T00:00:00Z"},
             {"count_user_id": 4, "time": "2018-01-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2018-04-01T00:00:00Z"},
             {"distinct_count_user_id": 1, "time": "2016-01-01T00:00:00Z"},
             {"distinct_count_user_id": 2, "time": "2016-04-01T00:00:00Z"},
             {"distinct_count_user_id": 2, "time": "2016-07-01T00:00:00Z"},
             {"distinct_count_user_id": 5, "time": "2016-10-01T00:00:00Z"},
             {"distinct_count_user_id": 2, "time": "2017-01-01T00:00:00Z"},
             {"distinct_count_user_id": 3, "time": "2017-04-01T00:00:00Z"},
             {"distinct_count_user_id": 6, "time": "2017-07-01T00:00:00Z"},
             {"distinct_count_user_id": 2, "time": "2017-10-01T00:00:00Z"},
             {"distinct_count_user_id": 4, "time": "2018-01-01T00:00:00Z"},
             {"distinct_count_user_id": 1, "time": "2018-04-01T00:00:00Z"}], json)
        self.assertEqual(20, len(json))
        self.assertEqual(30 + 28, sum(
            map(lambda p: p["count_user_id"] if "count_user_id" in p else p["distinct_count_user_id"], json)))

    def test_login_time_frame_group_by_month_ms(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2017-08-15", "to": "2017-09-05", "scale": "month", "epoch": "ms"})
        self.assertListEqual(
            [{"count_user_id": 4, "time": 1504224000000},
             {"distinct_count_user_id": 4, "time": 1504224000000}],
            json)
        self._assert_datetime_equals(json[0]["time"], "2017-09-01T00:00:00Z")

    def test_login_time_frame_group_by_month(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2014-01-01", "to": "2020-01-01", "scale": "month",
                                    "include_unique": "false"})
        self.assertListEqual(
            [{"count_user_id": 1, "time": "2016-03-01T00:00:00Z"}, {"count_user_id": 1, "time": "2016-04-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2016-05-01T00:00:00Z"}, {"count_user_id": 1, "time": "2016-07-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2016-08-01T00:00:00Z"}, {"count_user_id": 2, "time": "2016-10-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2016-11-01T00:00:00Z"}, {"count_user_id": 2, "time": "2016-12-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2017-02-01T00:00:00Z"}, {"count_user_id": 1, "time": "2017-03-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2017-04-01T00:00:00Z"}, {"count_user_id": 1, "time": "2017-05-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2017-06-01T00:00:00Z"}, {"count_user_id": 1, "time": "2017-07-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2017-08-01T00:00:00Z"}, {"count_user_id": 4, "time": "2017-09-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2017-10-01T00:00:00Z"}, {"count_user_id": 1, "time": "2018-01-01T00:00:00Z"},
             {"count_user_id": 3, "time": "2018-03-01T00:00:00Z"},
             {"count_user_id": 1, "time": "2018-05-01T00:00:00Z"}], json)
        self.assertEqual(30, sum(map(lambda p: p["count_user_id"], json)))

    def test_login_time_frame_group_by_quarter_and_sp(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2016-09-01", "to": "2017-05-20", "scale": "quarter",
                                    "include_unique": "false"})
        self.assertListEqual(
            [{"count_user_id": 6, "time": "2016-10-01T00:00:00Z"},
             {"count_user_id": 2, "time": "2017-01-01T00:00:00Z"},
             {"count_user_id": 4, "time": "2017-04-01T00:00:00Z"}],
            json)

    def test_login_time_frame_group_by_quarter_and_sp_idp(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2017-01-01", "to": "2017-03-31", "scale": "quarter",
                                    "group_by": " idp_id, sp_id , bogus", "include_unique": "false"})

        self.assertListEqual(
            [{"count_user_id": 2, "time": "2017-01-01T00:00:00Z"}],
            json)

    def test_login_time_frame_live(self):
        json = self.get("public/login_time_frame",
                        query_data={"from": "2018-05-24", "to": "2018-05-25", "scale": "minute"})
        self.assertEqual(24 * 60, len(json))
        self.assertEqual(1, len(list(filter(lambda p: p['count_user_id'], json))))

    def test_login_aggregated_by_week(self):
        json = self.get("public/login_aggregated", query_data={"period": "2016W41", "sp_id": "https://sp/2",
                                                               "idp_id": "https://idp/1"})
        self.assertListEqual([{"count_user_id": 1, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/2",
                               "time": "2016-10-10T00:00:00Z"},
                              {"distinct_count_user_id": 1, "idp_entity_id": "https://idp/1",
                               "sp_entity_id": "https://sp/2", "time": "2016-10-10T00:00:00Z"}], json)

        json = self.get("public/login_aggregated", query_data={"period": "2016W46"})
        self.assertListEqual([{"count_user_id": 2, "time": "2016-11-14T00:00:00Z"},
                              {"distinct_count_user_id": 2, "time": "2016-11-14T00:00:00Z"}], json)

        json = self.get("public/login_aggregated", query_data={"period": "2017W35"})
        self.assertListEqual(["no_results"], json)

    def test_login_aggregated_by_day(self):
        json = self.get("public/login_aggregated", query_data={"period": "2016D287"})
        self.assertListEqual([{"count_user_id": 1, "distinct_count_user_id": 1, "time": "2016-10-13T00:00:00Z"}], json)

        json = self.get("public/login_aggregated", query_data={"period": "2016D287", "sp_id": "https://sp/2"})
        self.assertListEqual([{"count_user_id": 1, "distinct_count_user_id": 1, "sp_entity_id": "https://sp/2",
                               "time": "2016-10-13T00:00:00Z"}], json)

        json = self.get("public/login_aggregated", query_data={"period": "2016D48"})
        self.assertListEqual(["no_results"], json)

    def test_login_aggregated_by_year(self):
        json = self.get("public/login_aggregated", query_data={"period": "2018"})
        self.assertListEqual([{"count_user_id": 5, "time": "2018-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 4, "time": "2018-01-01T00:00:00Z"}], json)

    def test_login_aggregated_by_month(self):
        json = self.get("public/login_aggregated", query_data={"period": "2017M9"})
        self.assertListEqual([{"count_user_id": 4, "time": "2017-09-01T00:00:00Z"},
                              {"distinct_count_user_id": 4, "time": "2017-09-01T00:00:00Z"}], json)

    def test_login_aggregated_by_month_ms(self):
        json = self.get("public/login_aggregated", query_data={"period": "2017M9", "epoch": "ms"})
        self.assertListEqual([{"count_user_id": 4, "time": 1504224000000},
                              {"distinct_count_user_id": 4, "time": 1504224000000}], json)
        self._assert_datetime_equals(json[0]["time"], "2017-09-01T00:00:00Z")

    def test_login_aggregated_by_month_no_results(self):
        json = self.get("public/login_aggregated", query_data={"period": "2222M9"})
        self.assertListEqual(["no_results"], json)

    def test_login_aggregated_year_group_by_idp(self):
        json = self.get("public/login_aggregated",
                        query_data={"period": "2017", "sp_id": "https://sp/1", "group_by": "idp_id"})
        self.assertListEqual(
            [{"count_user_id": 1, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/1",
              "time": "2017-01-01T00:00:00Z"},
             {"count_user_id": 1, "idp_entity_id": "https://idp/2", "sp_entity_id": "https://sp/1",
              "time": "2017-01-01T00:00:00Z"},
             {"distinct_count_user_id": 1, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/1",
              "time": "2017-01-01T00:00:00Z"},
             {"distinct_count_user_id": 1, "idp_entity_id": "https://idp/2", "sp_entity_id": "https://sp/1",
              "time": "2017-01-01T00:00:00Z"}],
            json)

    def test_login_aggregated_year_group_by_sp(self):
        json = self.get("public/login_aggregated",
                        query_data={"period": "2017", "idp_id": "https://idp/1", "group_by": "sp_id"})
        json = list(sorted(json, key=lambda p: p["sp_entity_id"]))
        self.assertListEqual([{"count_user_id": 1, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/1",
                               "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 1, "idp_entity_id": "https://idp/1",
                               "sp_entity_id": "https://sp/1", "time": "2017-01-01T00:00:00Z"},
                              {"count_user_id": 2, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/2",
                               "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 2, "idp_entity_id": "https://idp/1",
                               "sp_entity_id": "https://sp/2", "time": "2017-01-01T00:00:00Z"},
                              {"count_user_id": 2, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/3",
                               "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 2, "idp_entity_id": "https://idp/1",
                               "sp_entity_id": "https://sp/3", "time": "2017-01-01T00:00:00Z"},
                              {"count_user_id": 1, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/4",
                               "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 1, "idp_entity_id": "https://idp/1",
                               "sp_entity_id": "https://sp/4", "time": "2017-01-01T00:00:00Z"},
                              {"count_user_id": 1, "idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/5",
                               "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 1, "idp_entity_id": "https://idp/1",
                               "sp_entity_id": "https://sp/5", "time": "2017-01-01T00:00:00Z"}], json)

    def test_login_aggregated_year_group_by_sp_and_idp(self):
        json = self.get("public/login_aggregated",
                        query_data={"period": "2017", "idp_id": "https://idp/1",
                                    "sp_id": "https://sp/1", "group_by": "sp_id,idp_id"})
        self.assertListEqual(
            [{"idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/1", "count_user_id": 1,
              "time": "2017-01-01T00:00:00Z"},
             {"idp_entity_id": "https://idp/1", "sp_entity_id": "https://sp/1", "distinct_count_user_id": 1,
              "time": "2017-01-01T00:00:00Z"}], json)

    def test_login_aggregated_year_401(self):
        for forbidden_arg in ["idp_id", "sp_id", "group_by"]:
            query_string = {"period": "2017", forbidden_arg: "idp_id"}
            response = self.client.get("/api/stats/public/login_aggregated",
                                       query_string=query_string)
            self.assertEqual(401, response.status_code)
        response = self.client.get("/api/stats/public/login_aggregated",
                                   query_string={"period": "2017"})
        self.assertEqual(401, response.status_code)

    def test_login_aggregated_invalid(self):
        self.get("public/login_aggregated", response_status_code=500)

    def test_login_aggregated_period(self):
        json = self.get("public/login_aggregated", query_data={"period": "2017"})
        self.assertListEqual([{"count_user_id": 14, "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 9, "time": "2017-01-01T00:00:00Z"}], json)

    def test_login_aggregated_test_accepted(self):
        json = self.get("public/login_aggregated",
                        query_data={"period": "2017", "state": "testaccepted"})
        self.assertListEqual([{"count_user_id": 6, "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 5, "time": "2017-01-01T00:00:00Z"}], json)

    def test_login_aggregated_prod_accepted(self):
        json = self.get("public/login_aggregated",
                        query_data={"period": "2017", "state": "prodaccepted"})
        self.assertListEqual([{"count_user_id": 8, "time": "2017-01-01T00:00:00Z"},
                              {"distinct_count_user_id": 7, "time": "2017-01-01T00:00:00Z"}], json)

    def test_login_unique_login_count(self):
        json = self.get("public/unique_login_count",
                        query_data={"from": "1468793490", "to": "1506372026", "idp_id": "https://idp/1",
                                    "sp_id": "https://sp/2", "state": "prodaccepted"})
        self.assertListEqual([{'count_user_id': 2, 'distinct_count_user_id': 2, 'time': '2016-07-17T22:11:30Z'}], json)
