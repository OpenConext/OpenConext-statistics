import datetime
import logging

from dateutil import tz
from influxdb import InfluxDBClient
from isoweek import Week

periods = ["day", "week", "month", "quarter", "year"]
entity_types = ["sp", "idp", "sp_idp", "total"]
states = ["pa", "ta", "pa_ta"]

entity_tags = [("sp", "sp_entity_id"), ("idp", "idp_entity_id"),
               ("sp_idp", ["sp_entity_id", "idp_entity_id"])]


def _compute_if_absent(tree, keys):
    for k in keys:
        key = k if isinstance(k, str) else k[0]
        if key not in tree:
            tree[key] = {} if isinstance(k, str) else k[1]
        tree = tree[key]


def _reset_tree_period(tree, period_list):
    for p in period_list:
        for e in entity_types:
            for s in states:
                _compute_if_absent(tree, [p, e, s])
    for p in period_list:
        for s in states:
            tree[p]["total"][s] = {"count": 0, "users": []}


def backfill(host="localhost", port=8086, username="", password=""):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger()
    now = datetime.datetime.utcnow();

    logger.info("Started back-filling")

    db_name = "eb_logs_test"  # "eb_logs_test"

    client = InfluxDBClient(host=host, port=port, username=username, password=password, database=db_name,
                            timeout=60 * 60, retries=10)
    client.switch_database(db_name)
    measurement = "eb_logins_tst"

    points = list(client.query(f"select time, user_id from {measurement} order by time asc limit 1", epoch="ns")
                  .get_points())
    first_login = points[0]["time"]
    first_dt = datetime.datetime.utcfromtimestamp(first_login // 1000000000)
    start_first_date = datetime.datetime(first_dt.year, first_dt.month, first_dt.day, 0, 0, tzinfo=tz.tzutc())
    _from = int(start_first_date.timestamp())

    points = list(client.query(f"select time, user_id from {measurement} order by time desc limit 1", epoch="ns")
                  .get_points())
    last_login = points[0]["time"]
    last_dt = datetime.datetime.utcfromtimestamp(last_login // 1000000000)
    _to = int(datetime.datetime(last_dt.year, last_dt.month, last_dt.day, 0, 0, tzinfo=tz.tzutc()).timestamp())

    tree = {}

    _reset_tree_period(tree, periods)

    step = 60 * 60
    previous_date = {
        "day": start_first_date.day,
        "week": start_first_date.isocalendar()[1],
        "month": start_first_date.month,
        "quarter": ((start_first_date.month - 1) // 3) + 1,
        "year": start_first_date.year
    }
    for s in range(_from, _to + step, step):
        q = f"select * from {measurement} where time >= {s}s and time < {s + step}s"
        points = list(client.query(q, epoch="ns").get_points())
        if (len(points)) > 0:
            for p in points:
                dt = datetime.datetime.utcfromtimestamp(p["time"] // 1000000000)
                curr_day = dt.day
                curr_week = dt.isocalendar()[1]
                curr_month = dt.month
                curr_quarter = ((dt.month - 1) // 3) + 1
                curr_year = dt.year
                for info in [(curr_day, "day"), (curr_week, "week"), (curr_month, "month"),
                             (curr_quarter, "quarter"), (curr_year, "year")]:
                    curr_time_scale, period_type = info
                    if previous_date[period_type] != curr_time_scale and s != _from:
                        # the beginning of the period e.g. start of year, quarter of s
                        prev_year = previous_date["year"]
                        monday = Week(prev_year, previous_date["month"]).monday()
                        prev_month = previous_date["month"] if period_type in ["day", "month"] \
                            else monday.month if period_type == "week" \
                            else 1 if period_type == "year" \
                            else 1 + ((previous_date["quarter"] - 1) * 3)
                        prev_day = previous_date["day"] if period_type == "day" \
                            else monday.day if period_type == "week" else 1
                        begin_of_period = datetime.datetime(prev_year, prev_month, prev_day)
                        _write_to_measurement(tree, period_type, begin_of_period, client, logger, now)
                        del tree[period_type]
                        _reset_tree_period(tree, [period_type])
                        previous_date[period_type] = curr_time_scale
                    state_identifier = "pa" if p["state"] == "prodaccepted" else "ta"
                    user_id = p["user_id"]
                    for si in [state_identifier, "pa_ta"]:
                        for tag in entity_tags:
                            entities = tree[period_type][tag[0]][si]
                            entity_id = p[tag[1]] if isinstance(tag[1], str) else tuple([p[x] for x in tag[1]])
                            if entity_id in entities:
                                e = entities[entity_id]
                                e["count"] += 1
                                if user_id not in e["users"]:
                                    e["users"].append(user_id)
                            else:
                                entities[entity_id] = {"count": 1, "users": [user_id]}
                        total = tree[period_type]["total"][si]
                        total["count"] += 1
                        if user_id not in total["users"]:
                            total["users"].append(user_id)
    # Now write all data in the tree that has not been written, but to the current period
    for period in periods:
        last_login_year = last_dt.year
        monday = Week(last_login_year, last_dt.month).monday()
        last_quarter = ((last_dt.month - 1) // 3) + 1
        last_month = last_dt.month if period_type in ["day", "month"] \
            else monday.month if period_type == "week" \
            else 1 if period_type == "year" \
            else 1 + ((last_quarter - 1) * 3)
        last_day = last_dt.day if period_type == "day" \
            else monday.day if period_type == "week" else 1
        last_period = datetime.datetime(last_dt.year, last_month, last_day)
        _write_to_measurement(tree, period, last_period, client, logger, now)

    logger.info("Finished back-filling")


def _write_to_measurement(tree, period, dt, client, logger, now):
    records = tree[period]
    json_body = []
    quarter = ((dt.month - 1) // 3) + 1
    year = dt.year
    month = dt.month
    for tag in entity_tags:
        for state in states:
            for k, v in records[tag[0]][state].items():
                state_measurement_part = "" if state == "pa_ta" else f"{state}_"
                rec = {
                    "measurement": f"{tag[0]}_{state_measurement_part}users_{period}",
                    "tags": {
                        "month": f"{month}",
                        "quarter": f"{quarter}",
                        "year": f"{year}"
                    },
                    "fields": {
                        "count_user_id": v["count"],
                        "distinct_count_user_id": len(v["users"])
                    },
                    "time": dt
                }
                if isinstance(tag[1], str):
                    rec[tag[1]] = k
                else:
                    rec[tag[1][0]] = k[0]
                    rec[tag[1][1]] = k[1]
                json_body.append(rec)
    for state in states:
        total = records["total"][state]
        state_measurement_part = "" if state == "pa_ta" else f"{state}_"
        json_body.append(
            {
                "measurement": f"total_{state_measurement_part}users_{period}",
                "tags": {
                    "month": f"{month}",
                    "quarter": f"{quarter}",
                    "year": f"{year}"
                },
                "fields": {
                    "count_user_id": total["count"],
                    "distinct_count_user_id": len(total["users"])
                },
                "time": dt
            })
    client.write_points(json_body)
    logger.info(f"Wrote {len(json_body)} to measurements for {period} and date {dt}. "
                f"Running for {datetime.datetime.utcnow()-now}")


if __name__ == "__main__":
    backfill()
