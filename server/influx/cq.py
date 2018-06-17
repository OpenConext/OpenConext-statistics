"""
Will drop and re-create all measurements and continuous queries and backfill the measurements
from the main login measurement
"""
import logging

from influxdb import InfluxDBClient

logger = logging.getLogger()


def append_measurement(l, postfix=""):
    l.append(f"sp_idp_users_{period}{postfix}")
    l.append(f"idp_users_{period}{postfix}")
    l.append(f"sp_users_{period}{postfix}")
    l.append(f"total_users_{period}{postfix}")


measurements = []

for period in ["minute", "hour", "day", "week"]:
    append_measurement(measurements)
    if period != "minute":
        append_measurement(measurements, postfix="_unique")


def create_continuous_query(db, db_name, duration, is_unique, include_total, measurement_name, parent_name,
                            group_by=[]):
    q = "SELECT "
    q += "count(distinct(\"user_id\")) as distinct_count_user_id " \
        if is_unique else "sum(\"count_user_id\") as count_user_id "
    q += ", count(\"user_id\") as count_user_id " if is_unique and include_total else ""
    q += f"INTO \"{measurement_name}\" FROM \"{parent_name}\" "
    group_by.append(f"time({duration})")
    q += f"GROUP BY {', '.join(group_by)} "

    cq = f"CREATE CONTINUOUS QUERY \"{measurement_name}_cq\" " \
         f"ON \"{db_name}\" BEGIN {q} END"
    logger.warning(f"{cq}")
    db.query(cq)

    # backfill the history
    logger.warning(f"{q}")
    db.query(q)


def backfill_login_measurements(config, db: InfluxDBClient):
    db_name = config.database.name
    log_source = config.log.measurement
    sp = config.log.sp_id
    idp = config.log.idp_id

    for measurement in measurements:
        db.drop_measurement(measurement)

    continuous_queries = list(map(lambda x: x["name"], db.query("show continuous queries").get_points()))
    for cq in continuous_queries:
        db.query(f"drop continuous query {cq} on {db_name}")

    # First create all the unique count queries that have to run against the log_source
    for p in ["minute", "hour", "day", "week"]:
        duration = "1" + p[:1]
        include_total = p == "minute"
        unique_postfix = "_unique" if p != "minute" else ""
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True, include_total=include_total,
                                measurement_name=f"sp_idp_users_{p}{unique_postfix}", parent_name=log_source,
                                group_by=[sp, idp])
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True, include_total=include_total,
                                measurement_name=f"idp_users_{p}{unique_postfix}", parent_name=log_source,
                                group_by=[idp])
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True, include_total=include_total,
                                measurement_name=f"sp_users_{p}{unique_postfix}", parent_name=log_source, group_by=[sp])
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True, include_total=include_total,
                                measurement_name=f"total_users_{p}{unique_postfix}", parent_name=log_source,
                                group_by=[])

    for d, p in (("hour", "minute"), ("day", "hour"), ("week", "day")):
        duration = "1" + d[:1]
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                measurement_name=f"sp_idp_users_{d}", parent_name=f"sp_idp_users_{p}",
                                group_by=[sp, idp])
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                measurement_name=f"idp_users_{d}", parent_name=f"idp_users_{p}", group_by=[idp])
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                measurement_name=f"sp_users_{d}", parent_name=f"sp_users_{p}", group_by=[sp])
        create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                measurement_name=f"total_users_{d}", parent_name=f"total_users_{p}", group_by=[])
