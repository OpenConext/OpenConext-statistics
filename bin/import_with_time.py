import datetime
import logging
import random
import string
import time

from influxdb import InfluxDBClient


epoch = datetime.datetime.utcfromtimestamp(0)
d2015 = datetime.datetime(2015,1,1)
seconds_2015 = (d2015 - epoch).total_seconds()
seconds_now = int(round(time.time()))


def random_string(prefix="", k=15):
    return prefix + "".join(random.choices(string.ascii_uppercase + string.digits, k=k))


identity_providers = ["https://identity-provider/" + random_string() for _ in range(1, 15)]
service_providers = ["https://service-provider/" + random_string() for _ in range(1, 50)]
users = ["urn:collab:person:example.com:" + random_string(k=10) for _ in range(1, 15000)]


def import_test_data(host="localhost", port=8086, username="", password=""):
    logger = logging.getLogger()

    db_name = "eb_logs_poc"

    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    measurement = "eb_logins_tst"
    client.drop_measurement(measurement)
    # client.create_database(db_name)
    # created_5min = False
    # created_15min = False

    logger.info("Started importing records")

    for i in range(0, 10_000_000):
        r = random.randint(seconds_2015, seconds_now)
        rd = datetime.datetime.utcfromtimestamp(r)
        json_body = [
            {
                "measurement": measurement,
                "tags": {
                    "sp_entity_id": random.choice(service_providers),
                    "idp_entity_id": random.choice(identity_providers),
                },
                "fields": {
                    "user_id": random.choice(users)
                },
                "time": rd
            }
        ]
        client.write_points(json_body)

        # if i is 0:
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_idp_aggregates_min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(\"user_id\") as count_user_id, "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"sp_idp_users_min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(1m), idp_entity_id_tag, sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_aggregates_min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(\"user_id\") as count_user_id, "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"sp_users_min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(1m), sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_idp_aggregates_min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(\"user_id\") as count_user_id, "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"idp_users_min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(1m), idp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_total_min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(\"user_id\") as count_user_id, "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"total_users_min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(1m) END")
        #
        #     # now we need the unique ones per SP, IDP, combination and total for 5 minutes
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_idp_uniques_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"sp_idp_users_uniques_5min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(5m), idp_entity_id_tag, sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_uniques_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"sp_users_uniques_5min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(5m), sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_idp_uniques_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"idp_users_uniques_5min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(5m), idp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_uniques_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"total_users_5min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(5m) END")
        #
        #     # now we need the unique ones per SP, IDP, combination and total for 15 minutes
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_idp_uniques_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"sp_idp_users_uniques_15min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(15m), idp_entity_id_tag, sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_uniques_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"sp_users_uniques_15min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(5m), sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_idp_uniques_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"idp_users_uniques_15min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(15m), idp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_uniques_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "count(distinct(\"user_id\")) as distinct_count_user_id "
        #                  "INTO \"total_users_15min\" FROM \"eb_logins\" "
        #                  "GROUP BY time(15m) END")
        #
        # if not created_5min and "sp_idp_users_min" in list(map(lambda m: m["name"], client.get_list_measurements())):
        #     client.query("CREATE CONTINUOUS QUERY \"user_aggregates_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"count_user_id\") as count_user_id "
        #                  "INTO \"sp_idp_users_5min\" FROM \"sp_idp_users_min\" "
        #                  "GROUP BY time(5m), idp_entity_id_tag, sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_idp_aggregates_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"user_id\") as count_user_id "
        #                  "INTO \"idp_users_5min\" FROM \"idp_users_min\" "
        #                  "GROUP BY time(5m), idp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_aggregates_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"user_id\") as count_user_id "
        #                  "INTO \"sp_users_5min\" FROM \"sp_users_min\" "
        #                  "GROUP BY time(5m), sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_total_5min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"count_user_id\") as count_user_id "
        #                  "INTO \"total_users_5min\" FROM \"total_users_min\" "
        #                  "GROUP BY time(5m) END")
        #
        #     created_5min = True
        #
        # if not created_15min and "sp_idp_users_5min" in list(map(lambda m: m["name"], client.get_list_measurements())):
        #     client.query("CREATE CONTINUOUS QUERY \"user_aggregates_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"count_user_id\") as count_user_id "
        #                  "INTO \"sp_idp_users_15min\" FROM \"sp_idp_users_5min\" "
        #                  "GROUP BY time(15m), idp_entity_id_tag, sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_idp_aggregates_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"count_user_id\") as count_user_id "
        #                  "INTO \"idp_users_15min\" FROM \"idp_users_5min\" "
        #                  "GROUP BY time(15m), idp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_sp_aggregates_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"count_user_id\") as count_user_id "
        #                  "INTO \"sp_users_15min\" FROM \"sp_users_5min\" "
        #                  "GROUP BY time(15m), sp_entity_id_tag END")
        #     client.query("CREATE CONTINUOUS QUERY \"user_total_15min\" ON \"eb_logs_poc\" BEGIN "
        #                  "SELECT "
        #                  "sum(\"count_user_id\") as count_user_id "
        #                  "INTO \"total_users_15min\" FROM \"total_users_5min\" "
        #                  "GROUP BY time(15m) END")
        #     created_15min = True

        if i % 50000 is 0 and i is not 0:
            logger.info("Created another 50000 records")
            # logger.info("Measurements: " + str(list(map(lambda m: m["name"], client.get_list_measurements()))))

    logger.info("Finished importing records")


if __name__ == "__main__":
    import_test_data()
