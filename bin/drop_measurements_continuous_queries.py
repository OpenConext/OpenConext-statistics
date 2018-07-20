import logging
from influxdb import InfluxDBClient


def main(host="localhost", port=8086, username="", password=""):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("import")

    db_name = "eb_logs_test"
    drop_main_measurement = False
    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    continuous_queries = list(map(lambda m: m["name"], client.query("show continuous queries").get_points()))
    for cq in continuous_queries:
        _drop = f"drop continuous query {cq} on {db_name}"
        client.query(_drop)
        logger.info(_drop)
    measurements = list(map(lambda m: m["name"], client.get_list_measurements()))
    for m in measurements:
        if m != "eb_logins_tst" or drop_main_measurement:
            logger.info(f"dropping measurement {m}")
            client.drop_measurement(m)


if __name__ == "__main__":
    main()
