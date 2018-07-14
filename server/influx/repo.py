from flask import current_app
from influxdb.resultset import ResultSet

from server.influx.time import start_end_period, adjust_time, combine_time_duplicates

GROUPING_SCALES = ["month", "quarter", "year"]


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


def _determine_measurement(config, idp_entity_id, sp_entity_id, measurement_scale, state, group_by=None):
    include_sp = sp_entity_id or (group_by and config.log.sp_id in group_by)
    include_idp = idp_entity_id or (group_by and config.log.idp_id in group_by)

    measurement = ""
    measurement += "sp_" if include_sp else ""
    measurement += "idp_" if include_idp else ""
    measurement += "total_" if not include_idp and not include_sp else ""
    measurement += "pa_" if state == "prodaccepted" else "ta_" if state == "testaccepted" else ""
    measurement += f"users_{measurement_scale}"
    return measurement


def first_login_from_to(config, from_seconds=None, to_seconds=None, state=None, provider="sp"):
    _sp = provider == "sp"
    measurement = _determine_measurement(config, not _sp, _sp, "day", state)
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


def login_by_time_frame(config, scale="day", from_seconds=None, to_seconds=None, idp_entity_id=None, sp_entity_id=None,
                        include_unique=True, epoch=None, state=None):
    measurement_scale = scale if scale in ["minute", "hour", "day", "week"] else "day"
    measurement = _determine_measurement(config, idp_entity_id, sp_entity_id, measurement_scale, state)
    needs_grouping = scale in GROUPING_SCALES
    part = "sum(count_user_id) as count_user_id" if needs_grouping else "count_user_id as count_user_id"
    if scale == "minute":
        part += ", distinct_count_user_id as distinct_count_user_id"
    q = f"select {part} from {measurement} where 1=1"
    q += f" and time >= {from_seconds}s" if from_seconds else ""
    q += f" and time < {to_seconds}s" if to_seconds else ""
    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""

    if needs_grouping:
        group_by = "month, quarter, year" if scale == "month" else "quarter, year" if scale == "quarter" else "year"
        q += f" group by {group_by}"

    records = _query(q, group_by=needs_grouping, epoch=epoch)
    # weeks are not bound in months, quarters and result in duplicates as we group by month, quarter, year
    if scale == "week":
        records = combine_time_duplicates(records)

    if include_unique and scale != "minute":
        q = q.replace(f"select {part} from {measurement}",
                      f"select count(distinct(\"user_id\")) as distinct_count_user_id from {config.log.measurement}")
        if state:
            q = q.replace("where 1=1", f"where 1=1 and state = '{state}'")
        if not needs_grouping:
            q += f" group by time(1{measurement_scale[0:1]})"
        unique_records = _query(q, group_by=needs_grouping, epoch=epoch)
        records.extend(list(filter(lambda p: p["distinct_count_user_id"] != 0, unique_records)))
    return adjust_time(records, epoch) if needs_grouping else records


def login_by_aggregated(config, period, idp_entity_id=None, sp_entity_id=None, include_unique=True, group_by=[],
                        from_s=None, to_s=None, epoch=None, state=None):
    p = start_end_period(period) if period else (from_s, to_s)
    from_seconds, to_seconds = p
    measurement_scale = "day" if not period or len(period) == 4 else "week" if period[4:5] == "w" else "day"
    measurement = _determine_measurement(config, idp_entity_id, sp_entity_id, measurement_scale, state, group_by)

    q = f"select sum(count_user_id) as count_user_id from {measurement}"
    q += f" where 1=1 and time >= {from_seconds}s and time < {to_seconds}s "
    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""
    if group_by:
        group_by_tags = ",".join(group_by)
        q += f" group by {group_by_tags}"

    records = _query(q, group_by=group_by, epoch=epoch)

    if include_unique:
        q = q.replace(f"sum(count_user_id) as count_user_id from {measurement}",
                      f"count(distinct(user_id)) as distinct_count_user_id from {config.log.measurement}")
        if state:
            q = q.replace("where 1=1", f"where 1=1 and state = '{state}'")
        unique_records = _query(q, group_by=group_by, epoch=epoch)
        records.extend(list(filter(lambda p: p["distinct_count_user_id"] != 0, unique_records)))
    return records
