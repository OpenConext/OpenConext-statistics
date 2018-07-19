import datetime
import logging
import random
import string
import time

from influxdb import InfluxDBClient

number_of_records = 10_000
batch_size = 5_000

epoch = datetime.datetime.utcfromtimestamp(0)
d2015 = datetime.datetime(2015, 1, 1)
seconds_2015 = (d2015 - epoch).total_seconds()
seconds_now = int(round(time.time()))

second_increment = (seconds_now - seconds_2015) / number_of_records


def random_string(prefix="", k=15, include_ascii=False):
    coll = string.ascii_uppercase + string.digits if include_ascii else string.digits
    return prefix + "".join(random.choices(coll, k=k))


state = ["prodaccepted", "testaccepted"]


def import_test_data(host="localhost", port=8086, username="", password=""):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("import")

    db_name = "eb_logs_poc"  # "eb_logs_poc"

    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name,
                            timeout=60 * 60, retries=10)
    measurement = "eb_logins_tst"

    client.drop_database(db_name)
    client.create_database(db_name)
    client.switch_database(db_name)

    logger.info("Started importing records")
    second_asc = seconds_2015

    for i in range(0, int(number_of_records / batch_size)):
        json_body = []
        for j in range(0, batch_size):
            rd = datetime.datetime.utcfromtimestamp(second_asc)
            second_asc += second_increment
            json_body.append({
                "measurement": measurement,
                "tags": {
                    "idp_entity_id": random_string(prefix="https://identity-provider/", k=2),
                    "month": f"{rd.month}",
                    "quarter": f"{((rd.month-1)//3) + 1}",
                    "sp_entity_id": random_string(prefix="https://service-provider/", k=2),
                    "state": state[0] if random.randint(0, 5) < 4 else state[1],
                    "year": f"{rd.year}"
                },
                "fields": {
                    "user_id": "urn:collab:person:example.com:" + random_string(k=3)
                },
                "time": rd
            })
        client.write_points(json_body)
        if i % 10 is 0 and i is not 0:
            logger.info(f"Created another 50_000 records total now {'{:_}'.format(i * 5_000)}")

    logger.info("Finished importing records")


if __name__ == "__main__":
    import_test_data()
