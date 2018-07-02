from flask import current_app
from influxdb.resultset import ResultSet

from server.influx.time import start_end_period, grouping, period_to_scale


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


def _mock_metadata(res):
    tag_value = res["value"]
    return {"id": tag_value, "name_en": tag_value, "name_nl": tag_value, "status": "prodaccepted"}


def service_providers_tags(measurement, log_sp_tag):
    return _query(f"show tag values from {measurement} with key = {log_sp_tag}", _mock_metadata)


def identity_providers_tags(measurement, log_idp_tag):
    return _query(f"show tag values from {measurement} with key = {log_idp_tag}", _mock_metadata)


def min_time(log_measurement_name, log_user_id_field):
    return _get_time(log_measurement_name, log_user_id_field, ascending=True)


def max_time(log_measurement_name, log_user_id_field):
    return _get_time(log_measurement_name, log_user_id_field, ascending=False)


def _get_time(log_measurement_name, log_user_id_field, ascending=True):
    order_by = "asc" if ascending else "desc"
    return _query(f"select time, {log_user_id_field} from {log_measurement_name}"
                  f" order by time {order_by} limit 1")[0]["time"]


def _determine_measurement(config, group_by, idp_entity_id, sp_entity_id, measurement_scale):
    include_sp = sp_entity_id or config.log.sp_id in group_by
    include_idp = idp_entity_id or config.log.idp_id in group_by

    measurement = ""
    measurement += "sp_" if include_sp else ""
    measurement += "idp_" if include_idp else ""
    measurement += "total_" if not include_idp and not include_sp else ""
    measurement += f"users_{measurement_scale}"
    return measurement


def login_by_time_frame(config, scale="day", from_seconds=None, to_seconds=None, idp_entity_id=None, sp_entity_id=None,
                        include_unique=True, group_by=[], epoch=None):
    measurement_scale = scale if scale in ["minute", "hour", "day", "week"] else "day"
    measurement = _determine_measurement(config, group_by, idp_entity_id, sp_entity_id, measurement_scale)

    q = f"select * from {measurement} where 1=1"
    q += f" and time >= {from_seconds}s" if from_seconds else ""
    q += f" and time < {to_seconds}s" if to_seconds else ""
    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""
    if group_by:
        group_by_tags = ",".join(group_by)
        q += f" group by {group_by_tags}"
    records = _query(q, group_by=group_by, epoch=epoch)
    needs_grouping = scale in ["month", "quarter", "year"]
    if needs_grouping:
        records = grouping(records, scale, "count_user_id", group_by=group_by, epoch=epoch)

    if include_unique and scale != "minute":
        q = q.replace(measurement, f"{measurement}_unique")
        unique_records = _query(q, group_by=group_by, epoch=epoch)
        if needs_grouping:
            unique_records = grouping(unique_records, scale, "distinct_count_user_id", group_by=group_by, epoch=epoch)
        records.extend(unique_records)
    return records


def login_by_time_period(config, period, idp_entity_id=None, sp_entity_id=None, include_unique=True, group_by=[],
                         from_s=None, to_s=None, epoch=None):
    p = start_end_period(period) if period else (from_s, to_s)
    from_seconds, to_seconds = p
    measurement_scale = "day" if not period or len(period) == 4 else "week" if period[4:5] == "w" else "day"
    measurement = _determine_measurement(config, group_by, idp_entity_id, sp_entity_id, measurement_scale)

    q = f"select sum(count_user_id) as sum_count_user_id from {measurement} " \
        f"where 1=1 and time >= {from_seconds}s and time < {to_seconds}s "
    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""
    if group_by:
        group_by_tags = ",".join(group_by)
        q += f" group by {group_by_tags}"

    records = _query(q, group_by=group_by, epoch=epoch)
    scale = period_to_scale(period) if period else "day"
    needs_grouping = scale in ["month", "quarter", "year"]
    if needs_grouping:
        records = grouping(records, scale, "sum_count_user_id", group_by=group_by, epoch=epoch)

    if include_unique and scale != "minute":
        q = q.replace(f"sum(count_user_id) as sum_count_user_id from {measurement}",
                      f"sum(distinct_count_user_id) as sum_distinct_count_user_id from {measurement}_unique")
        unique_records = _query(q, group_by=group_by, epoch=epoch)
        if needs_grouping:
            unique_records = grouping(unique_records, scale, "sum_distinct_count_user_id", group_by=group_by,
                                      epoch=epoch)
        records.extend(unique_records)
    return records
