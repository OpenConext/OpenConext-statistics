from influxdb import InfluxDBClient


def main(host="localhost", port=8086, username="", password=""):
    db_name = "eb_logs_test"
    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    measurements = list(map(lambda m: m["name"], client.get_list_measurements()))
    for m in measurements:
        res = list(client.query(f"select count(*) from {m}").get_points())[0]
        res.pop("time")
        # print(f"{m}:{res}")
        if "day" in m:
            print(m)


if __name__ == "__main__":
    main()
