"""
Will drop and re-create all measurements and continuous queries and backfill the measurements
from the main login measurement
"""
import logging

from influxdb import InfluxDBClient

logger = logging.getLogger()


def append_measurement(l, period, postfix=""):
    l.append(f"sp_idp_users_{period}{postfix}")
    l.append(f"sp_idp_pa_users_{period}{postfix}")
    l.append(f"sp_idp_ta_users_{period}{postfix}")
    l.append(f"idp_users_{period}{postfix}")
    l.append(f"idp_pa_users_{period}{postfix}")
    l.append(f"idp_ta_users_{period}{postfix}")
    l.append(f"sp_users_{period}{postfix}")
    l.append(f"sp_pa_users_{period}{postfix}")
    l.append(f"sp_tp_users_{period}{postfix}")
    l.append(f"total_users_{period}{postfix}")
    l.append(f"total_pa_users_{period}{postfix}")
    l.append(f"total_ta_users_{period}{postfix}")


def get_measurements():
    measurements = []
    for period in ["minute", "hour", "day", "week"]:
        append_measurement(measurements, period)
        if period != "minute":
            append_measurement(measurements, period, postfix="_unique")
    return measurements


def create_continuous_query(db, db_name, duration, is_unique, include_total, measurement_name, parent_name,
                            group_by=[], state=None):
    q = "SELECT "
    q += "count(distinct(\"user_id\")) as distinct_count_user_id " \
        if is_unique else "sum(\"count_user_id\") as count_user_id "
    q += ", count(\"user_id\") as count_user_id " if is_unique and include_total else ""
    q += f"INTO \"{measurement_name}\" FROM \"{parent_name}\" "
    state_value = "prodaccepted" if state == "pa" else "testaccepted" if state == "ta" else None
    q += f" WHERE state = '{state_value}' " if state_value else ""
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

    databases = list(map(lambda p: p["name"], db.get_list_database()))

    if db_name not in databases:
        # we assume a test is running and we don't proceed with back filling
        return

    for measurement in get_measurements():
        db.drop_measurement(measurement)

    continuous_queries = list(map(lambda x: x["name"], db.query("show continuous queries").get_points()))
    for cq in continuous_queries:
        db.query(f"drop continuous query {cq} on {db_name}")

    # First create all the unique count queries that have to run against the log_source
    for p in ["minute", "hour", "day", "week"]:
        for state in ["pa", "ta", None]:
            duration = "1" + p[:1]
            include_total = p == "minute"
            unique_postfix = "_unique" if p != "minute" else ""
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True,
                                    include_total=include_total,
                                    measurement_name=f"sp_idp_{state}_users_{p}{unique_postfix}"
                                    if state else f"sp_idp_users_{p}{unique_postfix}",
                                    parent_name=log_source,
                                    group_by=[sp, idp],
                                    state=state)
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True,
                                    include_total=include_total,
                                    measurement_name=f"idp_{state}_users_{p}{unique_postfix}"
                                    if state else f"idp_users_{p}{unique_postfix}",
                                    parent_name=log_source,
                                    group_by=[idp],
                                    state=state)
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True,
                                    include_total=include_total,
                                    measurement_name=f"sp_{state}_users_{p}{unique_postfix}"
                                    if state else f"sp_users_{p}{unique_postfix}",
                                    parent_name=log_source,
                                    group_by=[sp],
                                    state=state)
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=True,
                                    include_total=include_total,
                                    measurement_name=f"total_{state}_users_{p}{unique_postfix}"
                                    if state else f"total_users_{p}{unique_postfix}",
                                    parent_name=log_source,
                                    group_by=[],
                                    state=state)

    for d, p in (("hour", "minute"), ("day", "hour"), ("week", "day")):
        duration = "1" + d[:1]
        for state in ["pa", "ta", None]:
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                    measurement_name=f"sp_idp_{state}_users_{d}"
                                    if state else f"sp_idp_users_{d}",
                                    parent_name=f"sp_idp_{state}_users_{p}"
                                    if state else f"sp_idp_users_{p}",
                                    group_by=[sp, idp])
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                    measurement_name=f"idp_{state}_users_{d}"
                                    if state else f"idp_users_{d}",
                                    parent_name=f"idp_{state}_users_{p}"
                                    if state else f"idp_users_{p}",
                                    group_by=[idp])
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                    measurement_name=f"sp_{state}_users_{d}"
                                    if state else f"sp_users_{d}",
                                    parent_name=f"sp_{state}_users_{p}"
                                    if state else f"sp_users_{p}",
                                    group_by=[sp])
            create_continuous_query(db=db, db_name=db_name, duration=duration, is_unique=False, include_total=False,
                                    measurement_name=f"total_{state}_users_{d}"
                                    if state else f"total_users_{d}",
                                    parent_name=f"total_{state}_users_{p}"
                                    if state else f"total_users_{p}",
                                    group_by=[])
