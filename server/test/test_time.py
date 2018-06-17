from datetime import datetime
from unittest import TestCase

from server.influx.time import month_start_end_seconds, week_start_end_seconds, \
    quarter_start_end_seconds, day_start_end_seconds, year_start_end_seconds, start_end_period


class TestTime(TestCase):

    def _assert_dates(self, expected_dates, result):
        self.assertEqual(expected_dates[0], str(datetime.fromtimestamp(result[0])))
        self.assertEqual(expected_dates[1], str(datetime.fromtimestamp(result[1])))

    def test_day_start_end_seconds(self):
        expected = ("2018-01-01 00:00:00", "2018-01-02 00:00:00")
        res = day_start_end_seconds(2018, 1)
        self._assert_dates(expected, res)

        res = start_end_period("2018d1")
        self._assert_dates(expected, res)

    def test_day_start_end_seconds_jan(self):
        expected = ("2018-01-31 00:00:00", "2018-02-01 00:00:00")
        res = day_start_end_seconds(2018, 31)
        self._assert_dates(expected, res)

        res = start_end_period("2018d31")
        self._assert_dates(expected, res)

    def test_day_start_end_seconds_end_of_year(self):
        expected = ("2018-12-31 00:00:00", "2019-01-01 00:00:00")
        res = day_start_end_seconds(2018, 365)
        self._assert_dates(expected, res)

        res = start_end_period("2018d365")
        self._assert_dates(expected, res)

    def test_day_start_end_seconds_start_of_year(self):
        expected = ("2018-01-01 00:00:00", "2018-01-02 00:00:00")
        res = day_start_end_seconds(2018, 1)
        self._assert_dates(expected, res)

    def test_week_start_end_seconds_middle(self):
        expected = ("2017-10-30 00:00:00", "2017-11-06 00:00:00")
        res = week_start_end_seconds(2017, 44)
        self._assert_dates(expected, res)

        res = start_end_period("2017w44")
        self._assert_dates(expected, res)

    def test_week_start_end_seconds_start_year(self):
        expected = ("2017-01-02 00:00:00", "2017-01-09 00:00:00")
        res = week_start_end_seconds(2017, 1)
        self._assert_dates(expected, res)

        res = start_end_period("2017w1")
        self._assert_dates(expected, res)

    def test_week_start_end_seconds_end_year(self):
        expected = ("2017-12-25 00:00:00", "2018-01-01 00:00:00")
        res = week_start_end_seconds(2017, 52)
        self._assert_dates(expected, res)

        res = start_end_period("2017w52")
        self._assert_dates(expected, res)

    def test_quarter_start_end_seconds(self):
        expected = ("2018-01-01 00:00:00", "2018-04-01 00:00:00")
        res = quarter_start_end_seconds(2018, 1)
        self._assert_dates(expected, res)

        res = start_end_period("2018Q1")
        self._assert_dates(expected, res)

    def test_quarter_start_end_seconds_end_year(self):
        expected = ("2018-10-01 00:00:00", "2019-01-01 00:00:00")
        res = quarter_start_end_seconds(2018, 4)
        self._assert_dates(expected, res)

        res = start_end_period("2018Q4")
        self._assert_dates(expected, res)

    def test_month_start_end_seconds(self):
        expected = ("2018-06-01 00:00:00", "2018-07-01 00:00:00")
        res = month_start_end_seconds(2018, 6)
        self._assert_dates(expected, res)

        res = start_end_period("2018M6")
        self._assert_dates(expected, res)

    def test_month_start_end_seconds_year_end(self):
        expected = ("2017-12-01 00:00:00", "2018-01-01 00:00:00")
        res = month_start_end_seconds(2017, 12)
        self._assert_dates(expected, res)

        res = start_end_period("2017M12")
        self._assert_dates(expected, res)

    def test_year_start_end_seconds(self):
        expected = ("2017-01-01 00:00:00", "2018-01-01 00:00:00")
        res = year_start_end_seconds(2017)
        self._assert_dates(expected, res)

        res = start_end_period("2017")
        self._assert_dates(expected, res)
