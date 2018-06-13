from influxdb import InfluxDBClient


def main(host="localhost", port=8086, username="", password=""):
    db_name = "eb_logs_poc"

    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name)
    measurements = ["eb_logins",
                    "idp_users_min",
                    "idp_users_uniques_15min",
                    "idp_users_uniques_5min",
                    "sp_idp_users_15min",
                    "sp_idp_users_5min",
                    "sp_idp_users_min",
                    "sp_idp_users_uniques_15min",
                    "sp_idp_users_uniques_5min",
                    "sp_users_min",
                    "sp_users_uniques_15min",
                    "sp_users_uniques_5min",
                    "test_d",
                    "test_data",
                    "total_users_15min",
                    "total_users_5min",
                    "total_users_min"]
    for m in measurements:
        client.drop_measurement(m)
    names = list(map(lambda m: m["name"], client.query("show continuous queries").get_points()))
    for name in names:
        client.query(f"drop continuous query {name} on eb_logs_poc")


if __name__ == "__main__":
    main()
