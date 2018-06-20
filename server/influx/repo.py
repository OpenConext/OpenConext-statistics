import datetime

from flask import current_app

from server.influx.time import start_end_period, group_by, period_to_scale

epoch = datetime.datetime.utcfromtimestamp(0)


def _query(s, transform=None):
    points = current_app.influx_client.query(s).get_points()
    if transform:
        points = map(transform, points)
    return list(points)


def service_providers(log_sp_tag):
    return list(set(_query(f"show tag values with key = {log_sp_tag}", lambda res: res["value"])))


def identity_providers(log_idp_tag):
    return list(set(_query(f"show tag values with key = {log_idp_tag}", lambda res: res["value"])))


def min_time(log_measurement_name, log_user_id_field):
    return _get_time(log_measurement_name, log_user_id_field, ascending=True)


def max_time(log_measurement_name, log_user_id_field):
    return _get_time(log_measurement_name, log_user_id_field, ascending=False)


def _get_time(log_measurement_name, log_user_id_field, ascending=True):
    order_by = "asc" if ascending else "desc"
    return _query(f"select time, {log_user_id_field} from {log_measurement_name}"
                  f" order by time {order_by} limit 1")[0]["time"]


def login_by_time_frame(config, scale="day", from_seconds=None, to_seconds=None, idp_entity_id=None, sp_entity_id=None,
                        include_unique=True):
    measurement_scale = scale if scale in ["minute", "hour", "day", "week"] else "day"
    measurement = ""
    measurement += "sp_" if sp_entity_id else ""
    measurement += "idp_" if idp_entity_id else ""
    measurement += "total_" if not idp_entity_id and not sp_entity_id else ""
    measurement += f"users_{measurement_scale}"

    q = f"select * from {measurement} where 1=1"
    q += f" and time >= {from_seconds}s" if from_seconds else ""
    q += f" and time < {to_seconds}s" if to_seconds else ""
    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if sp_entity_id else ""
    q += f" group by {config.log.idp_id}" if sp_entity_id and not idp_entity_id else ""
    q += f" group by {config.log.sp_id}" if idp_entity_id and not sp_entity_id else ""
    records = _query(q)
    needs_grouping = scale in ["month", "quarter", "year"]
    if needs_grouping:
        records = group_by(records, scale, "count_user_id")

    if include_unique and scale != "minute":
        q = q.replace(measurement, f"{measurement}_unique")
        unique_records = _query(q)
        if needs_grouping:
            unique_records = group_by(unique_records, scale, "distinct_count_user_id")
        records.extend(unique_records)
    return records


def login_by_time_period(config, period, idp_entity_id=None, sp_entity_id=None, include_unique=True):
    from_seconds, to_seconds = start_end_period(period)
    measurement_scale = "day" if len(period) == 4 else "week" if period[4:5] == "w" else "day"
    measurement = ""
    measurement += "sp_" if sp_entity_id else ""
    measurement += "idp_" if idp_entity_id else ""
    measurement += "total_" if not idp_entity_id and not sp_entity_id else ""
    measurement += f"users_{measurement_scale}"

    q = f"select sum(count_user_id) as sum_count_user_id from {measurement} " \
        f"where 1=1 and time >= {from_seconds}s and time < {to_seconds}s "
    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if sp_entity_id else ""

    scale = period_to_scale(period)
    needs_grouping = scale in ["month", "quarter", "year"]
    records = _query(q)
    if needs_grouping:
        records = group_by(records, scale, "sum_count_user_id")

    if include_unique and scale != "minute":
        q = q.replace(f"sum(count_user_id) as sum_count_user_id from {measurement}",
                      f"sum(distinct_count_user_id) as sum_distinct_count_user_id from {measurement}_unique")
        unique_records = _query(q)
        if needs_grouping:
            unique_records = group_by(unique_records, scale, "sum_distinct_count_user_id")
        records.extend(unique_records)
    return records
