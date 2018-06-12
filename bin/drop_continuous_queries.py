from influxdb import InfluxDBClient


def main(host="localhost", port=8086, username="", password=""):
    db_name = "eb_logs_poc"

    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    # list(map(lambda m: m["name"], client.get_list_measurements()))
    names = list(map(lambda m: m["name"], client.query("show continuous queries").get_points()))
    for name in names:
        client.query(f"drop continuous query {name} on eb_logs_poc")


if __name__ == "__main__":
    main()
