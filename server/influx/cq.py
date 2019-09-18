"""
Will drop and re-create all measurements and continuous queries and backfill the measurements
from the main login measurement
"""
import logging

from influxdb import InfluxDBClient

VALID_PERIODS = ["day", "week", "month", "quarter", "year"]
VALID_GROUP_BY = ["day", "week"]


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
    for period in VALID_PERIODS:
        append_measurement(measurements, period)
        if period != "day":
            append_measurement(measurements, period, postfix="_unique")
    return measurements


def create_continuous_query(db, db_name, duration, period, is_unique, include_total, measurement_name, parent_name,
                            group_by=[], state=None, additional_where_query=None):
    q = "SELECT "
    q += "count(distinct(\"user_id\")) as distinct_count_user_id " \
        if is_unique else "sum(\"count_user_id\") as count_user_id "
    q += ", count(\"user_id\") as count_user_id " if is_unique and include_total else ""
    q += f"INTO \"{measurement_name}\" FROM \"{parent_name}\" "
    state_value = "prodaccepted" if state == "pa" else "testaccepted" if state == "ta" else None
    q += f" WHERE state = '{state_value}' " if state_value else ""

    extra_query_part = ""
    if additional_where_query:
        extra_query_part = f" WHERE " if not state_value else ""
        extra_query_part += f" AND " if state_value else ""
        extra_query_part += f" {additional_where_query} "
        q += extra_query_part

    if period == "day" or (period == "week" and not is_unique):
        group_by += ["year", "month", "quarter"]

    if period in VALID_GROUP_BY:
        group_by += [f"time({'1w,4d' if period == 'week' else duration})"]

    if period in ["month", "quarter", "year"]:
        group_by.append("time(12600w)")
        group_by.append("year")
        if period in ["month", "quarter"]:
            group_by.append(period)

    if len(group_by) > 0:
        q += f"GROUP BY {', '.join(group_by)} "

    # See https://community.influxdata.com/t/dependent-continuous-queries-at-multiple-resolutions/638/3
    every = "1h" if period == "day" else "6h" if period == "week" else "1d"
    # See https://docs.influxdata.com/influxdb/v1.6/query_language/continuous_queries/#examples-of-advanced-syntax
    _for = ""
    if period in VALID_GROUP_BY:
        _for = "FOR 2" + period[:1]
    cq_query = q
    if additional_where_query:
        cq_query = cq_query.replace(extra_query_part, "")
    cq = f"CREATE CONTINUOUS QUERY \"{measurement_name}_cq\" " \
         f"ON \"{db_name}\" RESAMPLE EVERY {every} {_for} BEGIN {q if not additional_where_query else cq_query} END"

    logger = logging.getLogger("back-fill")

    logger.info(f"{cq}")
    db.query(cq)

    # back-fill the history
    logger.info(f"{q}")
    db.query(q)


def need_to_recreate_cq_measurement(db: InfluxDBClient, measurement, measurements, continuous_queries, db_name,
                                    is_restart):
    existing_measurement = measurement in measurements
    cq = f"{measurement}_cq"
    existing_cq = cq in continuous_queries

    if not is_restart or not existing_measurement or not existing_cq:
        logger = logging.getLogger("back-fill")
        msg = " cause of restart" if is_restart else ""
        if existing_measurement:
            logger.info(f"Dropping measurement {measurement}{msg}")
            db.drop_measurement(measurement)

        if existing_cq:
            logger.info(f"Dropping continuous query {cq} on {db_name}{msg}")
            db.query(f"drop continuous query {cq} on {db_name}")
        return True
    return False


def backfill_login_measurements(config, db: InfluxDBClient, is_restart=False):
    db_name = config.database.name
    log_source = config.log.measurement

    sp = config.log.sp_id
    idp = config.log.idp_id

    logger = logging.getLogger("back-fill")

    databases = list(map(lambda p: p["name"], db.get_list_database()))

    if db_name not in databases:
        # we assume a test is running and we don't proceed with back filling
        return
    db.switch_database(db_name)

    if not is_restart:
        for measurement in get_measurements():
            logger.info(f"Dropping measurement {measurement}")
            db.drop_measurement(measurement)

    continuous_queries = list(map(lambda x: x["name"], db.query("show continuous queries").get_points()))
    if not is_restart:
        for cq in continuous_queries:
            logger.info(f"Dropping continuous query {cq} on {db_name}")
            db.query(f"drop continuous query {cq} on {db_name}")

    # First create all the unique count queries that have to run against the log_source
    points = db.query("show measurements").get_points()
    measurements = list(map(lambda x: x["name"], points))
    for p in VALID_PERIODS:
        for state in ["pa", "ta", None]:
            duration = "1" + p[:1]
            include_total = p == "day"
            unique_postfix = "_unique" if p != "day" else ""

            m_name = f"sp_idp_{state}_users_{p}{unique_postfix}" if state else f"sp_idp_users_{p}{unique_postfix}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                        include_total=include_total,
                                        measurement_name=m_name,
                                        parent_name=log_source,
                                        group_by=[sp, idp],
                                        state=state)
            m_name = f"idp_{state}_users_{p}{unique_postfix}" if state else f"idp_users_{p}{unique_postfix}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                        include_total=include_total,
                                        measurement_name=m_name,
                                        parent_name=log_source,
                                        group_by=[idp],
                                        state=state)
            m_name = f"sp_{state}_users_{p}{unique_postfix}" if state else f"sp_users_{p}{unique_postfix}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                        include_total=include_total,
                                        measurement_name=m_name,
                                        parent_name=log_source,
                                        group_by=[sp],
                                        state=state)
            m_name = f"total_{state}_users_{p}{unique_postfix}" if state else f"total_users_{p}{unique_postfix}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                        include_total=include_total,
                                        measurement_name=m_name,
                                        parent_name=log_source,
                                        group_by=[],
                                        state=state)

    # put ("hour", "minute"), ("day", "hour") in front if minutes/hours need to supported
    for d, p in (("week", "day"), ("month", "week"), ("quarter", "week"),
                 ("year", "week")):
        duration = "1" + d[:1]
        for state in ["pa", "ta", None]:
            m_name = f"sp_idp_{state}_users_{d}" if state else f"sp_idp_users_{d}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=d, is_unique=False,
                                        include_total=False,
                                        measurement_name=m_name,
                                        parent_name=f"sp_idp_{state}_users_{p}" if state else f"sp_idp_users_{p}",
                                        group_by=[sp, idp])
            m_name = f"idp_{state}_users_{d}" if state else f"idp_users_{d}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=d, is_unique=False,
                                        include_total=False,
                                        measurement_name=m_name,
                                        parent_name=f"idp_{state}_users_{p}" if state else f"idp_users_{p}",
                                        group_by=[idp])
            m_name = f"sp_{state}_users_{d}" if state else f"sp_users_{d}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=d, is_unique=False,
                                        include_total=False,
                                        measurement_name=m_name,
                                        parent_name=f"sp_{state}_users_{p}" if state else f"sp_users_{p}",
                                        group_by=[sp])
            m_name = f"total_{state}_users_{d}" if state else f"total_users_{d}"
            if need_to_recreate_cq_measurement(db, m_name, measurements, continuous_queries, db_name, is_restart):
                create_continuous_query(db=db, db_name=db_name, duration=duration, period=d, is_unique=False,
                                        include_total=False,
                                        measurement_name=m_name,
                                        parent_name=f"total_{state}_users_{p}" if state else f"total_users_{p}",
                                        group_by=[])


def reinitialize_unique_week_cq(config, db: InfluxDBClient):
    db_name = config.database.name
    log_source = config.log.measurement
    db.switch_database(db_name)

    sp = config.log.sp_id
    idp = config.log.idp_id

    logger = logging.getLogger("back-fill")

    continuous_queries = list(filter(lambda cq: "week_unique" in cq,
                                     map(lambda x: x["name"], db.query("show continuous queries").get_points())))
    for cq in continuous_queries:
        logger.info(f"Dropping continuous query {cq} on {db_name}")
        db.query(f"drop continuous query {cq} on {db_name}")

    points = db.query("show measurements").get_points()
    measurements = list(filter(lambda m: "week_unique" in m, map(lambda x: x["name"], points)))
    for m in measurements:
        del_query = f"delete from {m} where time >= '2018-01-01 00:00:00'"
        logger.info(f"Deleting pre-2018 measurements: {del_query}")
        db.query(del_query)
    p = "week"
    for state in ["pa", "ta", None]:
        duration = "1" + p[:1]
        include_total = False
        unique_postfix = "_unique"

        m_name = f"sp_idp_{state}_users_{p}{unique_postfix}" if state else f"sp_idp_users_{p}{unique_postfix}"
        create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                include_total=include_total,
                                measurement_name=m_name,
                                parent_name=log_source,
                                group_by=[sp, idp],
                                state=state,
                                additional_where_query="time >= '2018-01-01 00:00:00'")
        m_name = f"idp_{state}_users_{p}{unique_postfix}" if state else f"idp_users_{p}{unique_postfix}"
        create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                include_total=include_total,
                                measurement_name=m_name,
                                parent_name=log_source,
                                group_by=[idp],
                                state=state,
                                additional_where_query="time >= '2018-01-01 00:00:00'")
        m_name = f"sp_{state}_users_{p}{unique_postfix}" if state else f"sp_users_{p}{unique_postfix}"
        create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                include_total=include_total,
                                measurement_name=m_name,
                                parent_name=log_source,
                                group_by=[sp],
                                state=state,
                                additional_where_query="time >= '2018-01-01 00:00:00'")
        m_name = f"total_{state}_users_{p}{unique_postfix}" if state else f"total_users_{p}{unique_postfix}"
        create_continuous_query(db=db, db_name=db_name, duration=duration, period=p, is_unique=True,
                                include_total=include_total,
                                measurement_name=m_name,
                                parent_name=log_source,
                                group_by=[],
                                state=state,
                                additional_where_query="time >= '2018-01-01 00:00:00'")
