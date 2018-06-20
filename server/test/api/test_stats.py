
from server.test.abstract_test import AbstractTest


class TestStats(AbstractTest):

    def test_service_providers(self):
        self.get("service_providers")
