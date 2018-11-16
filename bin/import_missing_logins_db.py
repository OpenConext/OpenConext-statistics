import datetime
import logging
import math
import os

import pymysql.cursors
from dateutil import tz
from influxdb import InfluxDBClient

influx_db_name = "eb_logs_missing"
influx_measurement = "dry_test"
influx_username = ""
influx_password = ""

mysql_host = "localhost"
mysql_user = "root"
mysql_password = ""
mysql_db = "stats"
mysql_charset = "utf8mb4"

sql_queries = {}

global_count = 0

states = {
    "PA": "prodaccepted",
    "TA": "testaccepted"
}


def read_file(file_name):
    if file_name in sql_queries:
        return sql_queries[file_name]

    file = f"{os.path.dirname(os.path.realpath(__file__))}/{file_name}"
    with open(file) as f:
        content = f.read()
        sql_queries[file_name] = content
        return content


def _local_seconds_to_utc_nano(dt, increment):
    ts = datetime.datetime(dt.year, dt.month, dt.day, tzinfo=tz.tzutc()).timestamp()
    return int(ts * 1000_000_000) + increment


def _influx_client():
    client = InfluxDBClient(host="localhost", port=8086, username=influx_username, password=influx_password,
                            database=influx_db_name, timeout=60 * 60, retries=10)
    client.switch_database(influx_db_name)
    return client


def append_chunk(serie, chunks):
    chunks.append(serie)
    if len(chunks) % 5000 is 0:
        _write_to_influx(chunks)


def _serie_skeleton(measurement, _from, time, row):
    serie = {
        "measurement": measurement,
        "tags": {
            "year": f"{_from.year}",
            "quarter": f"{math.floor((_from.month + 2) / 3)}",
            "month": _from.strftime("%m"),
            "idp_entity_id": row["idp_entityid"],
            "sp_entity_id": row["sp_entityid"],
            "state": states[row["idp_env"]]
        },
        "fields": {
            "user_id": "d5d343a91c2437914e2465c0f496f1e56f6745680391f4c66d0cea3542a24920"
        },
        "time": time
    }
    return serie


def _write_to_influx(chunks):
    if len(chunks) > 0:
        client = _influx_client()
        client.write_points(chunks)
        global global_count
        global_count += len(chunks)
        logger = logging.getLogger()
        logger.info(f"Wrote {len(chunks)} records to influx. Total written {global_count}")
        chunks.clear()


def _perform_query(chunks, con, measurement, date_string):
    query = read_file(f"sql/sp_idp_per_day.sql").replace("@@date@@", date_string)
    increment = 0
    with con.cursor(pymysql.cursors.SSDictCursor) as inner_cursor:
        inner_cursor.execute(query)
        for row in inner_cursor:
            _from = row["period_from"]
            for i in range(0, row["logins"]):
                increment = increment + 1
                time = _local_seconds_to_utc_nano(_from, increment)
                serie = _serie_skeleton(measurement, _from, time, row)
                append_chunk(serie, chunks)


def import_missing_days():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger()

    now = datetime.datetime.now()
    logger.info(f"start importing at {now}")

    con = pymysql.connect(host=mysql_host, user=mysql_user, password=mysql_password, db=mysql_db, charset=mysql_charset)
    dates = ["2018-01-01", "2018-01-02", "2018-01-03", "2018-01-04", "2018-01-05"]
    try:
        chunks = []
        for date in dates:
            _perform_query(chunks, con, influx_measurement, date)
        _write_to_influx(chunks)

    finally:
        con.close()

    logger.info(f"Finished importing in {datetime.datetime.now() - now}")


if __name__ == "__main__":
    import_missing_days()
