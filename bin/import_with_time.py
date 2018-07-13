import datetime
import logging
import random
import string
import time

from influxdb import InfluxDBClient

epoch = datetime.datetime.utcfromtimestamp(0)
d2015 = datetime.datetime(2015, 1, 1)
seconds_2015 = (d2015 - epoch).total_seconds()
seconds_now = int(round(time.time()))


def random_string(prefix="", k=15):
    return prefix + "".join(random.choices(string.ascii_uppercase + string.digits, k=k))


identity_providers = ["https://identity-provider/" + random_string() for _ in range(1, 15)]
service_providers = ["https://service-provider/" + random_string() for _ in range(1, 50)]
users = ["urn:collab:person:example.com:" + random_string(k=10) for _ in range(1, 15000)]
state = ["prodaccepted", "testaccepted"]


def import_test_data(host="localhost", port=8086, username="", password=""):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("import")

    db_name = "eb_logs_poc"

    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    measurement = "eb_logins_tst"

    client.drop_database(db_name)
    client.create_database(db_name)
    client.switch_database(db_name)

    logger.info("Started importing records")

    for i in range(0, 100_000):
        r = random.randint(seconds_2015, seconds_now)
        rd = datetime.datetime.utcfromtimestamp(r)
        json_body = [
            {
                "measurement": measurement,
                "tags": {
                    "sp_entity_id": random.choice(service_providers),
                    "idp_entity_id": random.choice(identity_providers),
                    "state": state[0] if random.randint(0, 5) < 4 else state[1],
                    "month": f"{rd.month}",
                    "quarter": f"{((rd.month-1)//3) + 1}",
                    "year": f"{rd.year}"
                },
                "fields": {
                    "user_id": random.choice(users)
                },
                "time": rd
            }
        ]
        client.write_points(json_body)
        if i % 5000 is 0 and i is not 0:
            logger.info("Created another 5000 records")

    logger.info("Finished importing records")


if __name__ == "__main__":
    import_test_data()
