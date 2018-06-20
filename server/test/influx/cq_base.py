from server.test.abstract_test import AbstractTest


class CqBase(AbstractTest):

    def create_app(self):
        app = super(CqBase, self).create_app()
        # Force creation of Continuous Queries
        app.influx_client.drop_database(app.influx_config.database.name)
        return app

    def test_cq(self):
        measurements_count = len(list(self.app.influx_client.get_list_measurements()))
        self.assertEqual(29, measurements_count)
