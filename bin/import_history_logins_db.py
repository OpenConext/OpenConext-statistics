import datetime
import logging
import math
import os

import pymysql.cursors
from dateutil import tz
from influxdb import InfluxDBClient

periods = {"d": "day", "w": "week", "m": "month", "q": "quarter", "y": "year"}
sql_queries = {}

global_count = 0


def read_file(file_name):
    if file_name in sql_queries:
        return sql_queries[file_name]

    file = f"{os.path.dirname(os.path.realpath(__file__))}/{file_name}"
    with open(file) as f:
        content = f.read()
        sql_queries[file_name] = content
        return content


def _local_seconds_to_utc_nano(dt):
    ts = datetime.datetime(dt.year, dt.month, dt.day, tzinfo=tz.tzutc()).timestamp()
    return int(ts * 1000_000_000)


def _influx_client():
    db_name = "dry_run"  # "eb_logs_test"  # "eb_logs_poc"
    client = InfluxDBClient(host="localhost", port=8086, username="", password="", database=db_name,
                            timeout=60 * 60, retries=10)
    client.switch_database(db_name)
    return client


def _serie_skeleton(measurement, _from, time):
    return {
        "measurement": measurement,
        "tags": {
            "year": f"{_from.year}"
        },
        "fields": {},
        "time": time
    }


def append_chunk(serie, chunks):
    chunks.append(serie)
    if len(chunks) % 5000 is 0:
        _write_to_influx(chunks)


def _influx_serie(chunks, row, prefix, state, test_accepted_chunks={}):
    period_type = periods[row["period_type"]]
    prefix_state = f"_{state}" if len(state) > 0 else ""
    measurement = f"{prefix}{prefix_state}_users_{period_type}"
    _from = row["period_from"]
    time = _local_seconds_to_utc_nano(_from) if period_type in ["day", "week"] else 0
    serie = _serie_skeleton(measurement, _from, time)
    if "idp_entityid" in row:
        serie["tags"]["idp_entity_id"] = row["idp_entityid"]
    if "sp_entityid" in row:
        serie["tags"]["sp_entity_id"] = row["sp_entityid"]

    # we need to add the test_accepted value if it is not pa or ta
    addendum_logins = 0
    if state != "pa":
        sp_entity_id = row["sp_entityid"] if "sp_entityid" in row else ""
        idp_entity_id = row["idp_entityid"] if "idp_entityid" in row else ""
        key = f"{period_type}_{_from.strftime('%Y-%m-%d')}_{sp_entity_id}_{idp_entity_id}"
        if state == "ta":
            test_accepted_chunks[key] = row["logins"]
        elif state == "" and key in test_accepted_chunks:
            addendum_logins = test_accepted_chunks[key]

    serie["fields"]["count_user_id"] = row["logins"] + addendum_logins
    serie["tags"]["month"] = _from.month
    serie["tags"]["quarter"] = math.floor((_from.month + 2) / 3)
    if period_type == "day":
        serie["fields"]["distinct_count_user_id"] = row["users"]
    else:
        unique_serie = _serie_skeleton(f"{measurement}_unique", _from, time)
        unique_serie["fields"]["distinct_count_user_id"] = row["users"]
        unique_serie["tags"]["month"] = _from.month
        unique_serie["tags"]["quarter"] = math.floor((_from.month + 2) / 3)
        append_chunk(unique_serie, chunks)
    append_chunk(serie, chunks)


def _write_to_influx(chunks):
    if len(chunks) > 0:
        client = _influx_client()
        client.write_points(chunks)
        global global_count
        global_count += len(chunks)
        logger = logging.getLogger()
        logger.info(f"Wrote {len(chunks)} records to influx. Total written {global_count}")
        chunks.clear()


def _perform_query(chunks, con, prefix, state, ta_numbers, entity_id=None):
    query = read_file(f"/sql/{prefix}.sql").replace(
        "@@environment@@", state.upper())
    if entity_id:
        query = query.replace("@@entityid@@", entity_id)
    with con.cursor(pymysql.cursors.SSDictCursor) as inner_cursor:
        inner_cursor.execute(query)
        for row in inner_cursor:
            _influx_serie(chunks, row, prefix, state, ta_numbers)
            if state == "pa":
                _influx_serie(chunks, row, prefix, "", ta_numbers)


def import_history():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger()

    now = datetime.datetime.now()
    logger.info(f"start importing at {now}")

    con = pymysql.connect(host="localhost", user="root", password="", db="statsdb", charset="utf8mb4")
    try:
        with con.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT distinct(entityid) FROM statsview_sp")
            service_providers = cursor.fetchall()
            cursor.execute("SELECT distinct(entityid) FROM statsview_idp")
            identity_providers = cursor.fetchall()

        chunks = []
        for prefix in ["sp", "sp_idp"]:
            ta_numbers = {}
            for state in ["ta", "pa"]:
                for sp in service_providers:
                    _perform_query(chunks, con, prefix, state, ta_numbers, sp["entityid"])

        ta_numbers = {}
        for state in ["ta", "pa"]:
            for idp in identity_providers:
                _perform_query(chunks, con, "idp", state, ta_numbers, idp["entityid"])

        ta_numbers = {}
        for state in ["ta", "pa"]:
            _perform_query(chunks, con, "total", state, ta_numbers)

        _write_to_influx(chunks)

    finally:
        con.close()

    logger.info(f"Finished importing in {datetime.datetime.now() - now}")


if __name__ == "__main__":
    import_history()
