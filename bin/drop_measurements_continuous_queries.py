from influxdb import InfluxDBClient


def main(host="localhost", port=8086, username="", password=""):
    db_name = "eb_logs_poc"
    drop_main_measurement = False
    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    measurements = list(map(lambda m: m["name"], client.get_list_measurements()))
    for m in measurements:
        if m != "eb_logins_tst" or drop_main_measurement:
            client.drop_measurement(m)
    continuous_queries = list(map(lambda m: m["name"], client.query("show continuous queries").get_points()))
    for cq in continuous_queries:
        client.query(f"drop continuous query {cq} on eb_logs_poc")


if __name__ == "__main__":
    main()
