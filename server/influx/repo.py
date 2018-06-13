import datetime

from flask import current_app

epoch = datetime.datetime.utcfromtimestamp(0)


def _query(s, transform=None):
    points = current_app.influx_client.query(s).get_points()
    if transform:
        points = map(transform, points)
    return list(points)


def service_providers(log_sp_tag):
    return _query(f"show tag values with key = {log_sp_tag}", lambda res: res["value"])


def identity_providers(log_idp_tag):
    return _query(f"show tag values with key = {log_idp_tag}", lambda res: res["value"])


def min_time(log_measurement_name, log_user_id_field):
    return _get_time(log_measurement_name, log_user_id_field, ascending=True)


def max_time(influx_db_client, log_measurement_name, log_user_id_field):
    return _get_time(influx_db_client, log_measurement_name, log_user_id_field, ascending=False)


def _get_time(log_measurement_name, log_user_id_field, ascending=True):
    order_by = "asc" if ascending else "desc"
    return _query(f"select time, {log_user_id_field} from {log_measurement_name} order by time {order_by} limit 1") \
        [0]["time"]


def login_by_time_frame(config, from_seconds=None, to_seconds=None, idp_entity_id=None, sp_entity_id=None, scale="day",
                        include_unique=True):
    measurement = ""
    measurement += "sp_" if sp_entity_id else ""
    measurement += "idp_" if idp_entity_id else ""
    measurement += "total_" if not idp_entity_id and not sp_entity_id else ""
    measurement += f"users{scale}"

    q = f"select * from {measurement} where 1=1"
    q += f" and time >= {from_seconds}s" if from_seconds else ""
    q += f" and time <= {to_seconds}s" if to_seconds else ""
    q += f" and {config.log.sp_id} = {sp_entity_id}" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = {idp_entity_id}" if sp_entity_id else ""
    res = _query(q)
    if include_unique:
        print("TODO")
    return res