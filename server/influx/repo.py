from flask import current_app
from influxdb.resultset import ResultSet

from server.influx.time import start_end_period, adjust_time, remove_aggregated_time_info, filter_time

GROUPING_SCALES = ["month", "quarter", "year"]
MEASUREMENT_SCALES = {"d": "day", "w": "week", "m": "month", "q": "quarter"}


def get_points_with_tags(result_set: ResultSet):
    for row in result_set.raw["series"] if "series" in result_set.raw else []:
        for point in row.get("values", []):
            yield {**dict(zip(row["columns"], point)), **row["tags"]}


def _query(s, transform=None, group_by=None, epoch=None):
    result_set = current_app.influx_client.query(s, epoch=epoch)
    # The tags are in the ResultSet but not included in the get_points
    points = get_points_with_tags(result_set) if group_by else result_set.get_points()
    if transform:
        points = map(transform, points)
    return list(points)


def _transform_tags(res):
    return res["value"]


def service_providers_tags(measurement, log_sp_tag):
    return _query(f"show tag values from {measurement} with key = {log_sp_tag}", _transform_tags)


def identity_providers_tags(measurement, log_idp_tag):
    return _query(f"show tag values from {measurement} with key = {log_idp_tag}", _transform_tags)


def database_stats():
    client = current_app.influx_client
    measurements = list(map(lambda m: m["name"], client.get_list_measurements()))
    res = []
    for m in measurements:
        res.append({"name": m, "results": list(client.query(f"select count(*) from {m}").get_points())})
    config = current_app.app_config
    res.append({"config": {"database": config.database.name, "measurement": config.log.measurement}})
    return res


def drop_measurements_and_cq(main_measurement, database):
    client = current_app.influx_client
    measurements = list(map(lambda m: m["name"], client.get_list_measurements()))
    for m in measurements:
        if m != main_measurement:
            client.drop_measurement(m)
    continuous_queries = list(map(lambda m: m["name"], client.query("show continuous queries").get_points()))
    for cq in continuous_queries:
        client.query(f"drop continuous query {cq} on {database}")


def _determine_measurement(config, idp_entity_id, sp_entity_id, measurement_scale, state, group_by=None):
    if measurement_scale in ["minute", "hour"]:
        return config.log.measurement

    include_sp = sp_entity_id or (group_by and config.log.sp_id in group_by)
    include_idp = idp_entity_id or (group_by and config.log.idp_id in group_by)

    measurement = ""
    measurement += "sp_" if include_sp else ""
    measurement += "idp_" if include_idp else ""
    measurement += "total_" if not include_idp and not include_sp else ""
    measurement += "pa_" if state == "prodaccepted" else "ta_" if state == "testaccepted" else ""
    measurement += f"users_{measurement_scale}"
    return measurement


def first_login_from_to(config, from_seconds=None, to_seconds=None, provider="sp"):
    _sp = provider == "sp"
    measurement = _determine_measurement(config, not _sp, _sp, "day", None)
    q = f"select * from {measurement} group by {config.log.sp_id if _sp else config.log.idp_id} " \
        f"order by time asc limit 1"

    records = _query(q, group_by=True, epoch="ms")
    fs = int(from_seconds) * 1000
    ts = int(to_seconds) * 1000
    return list(filter(lambda p: fs <= p["time"] < ts, records))


def last_login_providers(config, state=None, provider="sp"):
    _sp = provider == "sp"
    measurement = _determine_measurement(config, not _sp, _sp, "day", state)
    q = f"select * from {measurement} group by {config.log.sp_id if _sp else config.log.idp_id} " \
        f"order by time desc limit 1"

    return _query(q, group_by=True, epoch="ms")


def login_by_time_frame(config, from_seconds, to_seconds, scale="day", idp_entity_id=None, sp_entity_id=None,
                        include_unique=True, epoch=None, state=None):
    measurement = _determine_measurement(config, idp_entity_id, sp_entity_id, scale, state)
    if scale in ["minute", "hour"]:
        q = f"select count(user_id) as count_user_id from {measurement} where 1=1"
    else:
        q = f"select * from {measurement} where 1=1"
    needs_grouping = scale in GROUPING_SCALES

    if not needs_grouping:
        q += f" and time >= {from_seconds}s and time < {to_seconds}s"

    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""

    # we don't have aggregated measurements for these
    if scale in ["minute", "hour"]:
        time_scale = "1m" if scale == "minute" else "1h"
        q += f" group by time({time_scale})"

    records = _query(q, epoch=epoch)
    # the actual time for non-supported date literals is nonsense in the influx database
    if needs_grouping:
        records = filter_time(from_seconds, to_seconds, adjust_time(records, epoch))

    if include_unique and scale not in ["minute", "hour"]:
        q = q.replace(f"from {measurement}",
                      f"from {measurement}_unique")
        unique_records = _query(q, epoch=epoch)
        if needs_grouping:
            unique_records = filter_time(from_seconds, to_seconds, adjust_time(unique_records, epoch))
        records.extend(unique_records)
    return remove_aggregated_time_info(records)


def login_count_per_idp_sp(config, from_seconds, to_seconds, idp_entity_id, sp_entity_id, epoch=None, state=None):
    q = f"select count(user_id) as count_user_id, count(distinct(user_id)) as distinct_count_user_id " \
        f"from {config.log.measurement} " \
        f"where time >= {from_seconds}s and time < {to_seconds}s " \
        f"and {config.log.sp_id} = '{sp_entity_id}' " \
        f"and {config.log.idp_id} = '{idp_entity_id}' "
    q += f" and state = '{state}'" if state else ""
    records = _query(q, epoch=epoch)
    return remove_aggregated_time_info(records)


def login_by_aggregated(config, period, idp_entity_id=None, sp_entity_id=None, include_unique=True, group_by=[],
                        epoch=None, state=None, group_by_period=None):
    measurement_scale = "year" if len(period) == 4 \
        else MEASUREMENT_SCALES[period[4:5].lower()]
    measurement_adjustment_period = group_by_period if group_by_period else measurement_scale
    measurement = _determine_measurement(config, idp_entity_id, sp_entity_id, measurement_adjustment_period, state,
                                         group_by)

    q = f"select * from {measurement}"
    needs_grouping = measurement_scale in GROUPING_SCALES
    if needs_grouping:
        q += f" where 1=1 and year = '{period[0:4]}'"
        if measurement_scale != "year":
            tag_value = period[5:]
            tag_value = "0" + tag_value if len(tag_value) == 1 and measurement_scale == "month" else tag_value
            q += f" and {measurement_scale} = '{tag_value}'"
    else:
        from_seconds, to_seconds = start_end_period(period)
        q += f" where 1=1 and time >= {from_seconds}s and time < {to_seconds}s "

    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""

    records = _query(q, group_by=False, epoch=epoch)
    if needs_grouping and measurement_adjustment_period in GROUPING_SCALES:
        records = adjust_time(records, epoch)

    if include_unique:
        q = q.replace(f"from {measurement}",
                      f"from {measurement}_unique")
        # unique_records = _query(q, group_by=bool(group_by_period), epoch=epoch)
        unique_records = _query(q, group_by=False, epoch=epoch)
        if needs_grouping and measurement_adjustment_period in GROUPING_SCALES:
            unique_records = adjust_time(unique_records, epoch)
        records.extend(unique_records)
    return remove_aggregated_time_info(records)
