import datetime

from flask import current_app

epoch = datetime.utcfromtimestamp(0)


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
    result = current_app.influx_client.query(
        f"select time, {log_user_id_field} from {log_measurement_name} order by time {order_by} limit 1")
    return _query[0]["time"]


# add state="prodaccepted"
# scale=minute, day, week, month, year
# period => day, week, month, quarter, year
def nbr_login(from_seconds, to_seconds, idp_entity_id=None, sp_entity_id=None, scale="day"):
    measurement = f"{'sp_' if sp_entity_id else ''}{'idp_' if idp_entity_id else ''}" \
                  f"{'total_' if not idp_entity_id and not sp_entity_id}users_{scale}"
    q = f"select * from {measurement} where "
    q += ""
    if from_seconds:
        from_date = datetime.strptime(from_date, "%Y-%m-%d")

    return _query()
