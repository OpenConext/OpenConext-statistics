import logging


def backfill(host="localhost", port=8086, username="", password=""):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger()

    logger.info("Started back-filling")

    db_name = "eb_logs_test"  # "eb_logs_poc"

    # client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name,
    #                         timeout=60 * 60, retries=10)
    # client.switch_database(db_name)
    # measurement = "eb_logins_tst"
    #
    # points = list(client.query(f"select time, user_id from {measurement} order by time asc limit 1", epoch="ns")
    #               .get_points())
    # first_login = points[0]["time"]
    # points = list(client.query(f"select time, user_id from {measurement} order by time desc limit 1", epoch="ns")
    #               .get_points())
    # last_login = points[0]["time"]
    # first_dt = datetime.datetime.utcfromtimestamp(first_login // 1000000000)
    # _from = datetime.datetime(first_dt.year, first_dt.month, first_dt.day, 0, 0, tzinfo=tz.tzutc()).timestamp()
    #
    # last_dt = datetime.datetime.utcfromtimestamp(last_login // 1000000000)
    # _to = datetime.datetime(last_dt.year, last_dt.month, last_dt.day, 0, 0, tzinfo=tz.tzutc()).timestamp()

    tree = {}

    def compute_if_absent(d, keys):
        for k in keys:
            key = k if isinstance(k, str) else k[0]
            if key not in d:
                d[key] = {} if isinstance(k, str) else k[1]
            d = d[key]

    periods = ["day", "week", "month", "quarter", "year"]
    entities = ["sp", "idp", "sp_idp", "total"]
    states = ["pa", "ta", "pa_ta"]
    uniqueness = [("sum", 0), ("uniques", set())]
    for p in periods:
        for e in entities:
            for s in states:
                for u in uniqueness:
                    compute_if_absent(tree, [p, e, s, u])
    print(tree)

    # points = list(
    #     client.query(f"select * from {measurement} where time >= {_from}s and time < {_to}",
    #                  epoch="ns").get_points())

    logger.info("Finished back-filling")


if __name__ == "__main__":
    backfill()
