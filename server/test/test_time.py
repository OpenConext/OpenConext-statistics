from datetime import datetime
from unittest import TestCase

from server.influx.time import unix_time_seconds


class TestTime(TestCase):

    def test_unix_time_seconds(self):
        res = unix_time_seconds(datetime(1970,1,2))
        self.assertEqual(24 * 3600, res)
