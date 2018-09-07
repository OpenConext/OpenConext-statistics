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


#TODO
# We need to support hours & 1 minute group by against live measurements - max nbr of days is 7
# Select count(*) from eb_logins_tst where time > 1522110440888744192 group by time(5m)
def login_by_time_frame(config, from_seconds, to_seconds, scale="day", idp_entity_id=None, sp_entity_id=None,
                        include_unique=True, epoch=None, state=None):
    measurement = _determine_measurement(config, idp_entity_id, sp_entity_id, scale, state)
    q = f"select * from {measurement} where 1=1"
    needs_grouping = scale in GROUPING_SCALES

    if not needs_grouping:
        q += f" and time >= {from_seconds}s and time < {to_seconds}s"

    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""

    records = _query(q, epoch=epoch)
    # the actual time for non-supported date literals is nonsense in the influx database
    if needs_grouping:
        records = filter_time(from_seconds, to_seconds, adjust_time(records, epoch))

    if include_unique and scale != "minute":
        q = q.replace(f"from {measurement}",
                      f"from {measurement}_unique")
        unique_records = _query(q, epoch=epoch)
        if needs_grouping:
            unique_records = filter_time(from_seconds, to_seconds, adjust_time(unique_records, epoch))
        records.extend(unique_records)
    return remove_aggregated_time_info(records)


def login_by_aggregated(config, period, idp_entity_id=None, sp_entity_id=None, include_unique=True, group_by=[],
                        epoch=None, state=None):
    measurement_scale = "year" if len(period) == 4 else MEASUREMENT_SCALES[period[4:5].lower()]
    measurement = _determine_measurement(config, idp_entity_id, sp_entity_id, measurement_scale, state, group_by)

    q = f"select * from {measurement}"
    needs_grouping = measurement_scale in GROUPING_SCALES
    if needs_grouping:
        q += f" where 1=1 and year = '{period[0:4]}'"
        if measurement_scale != "year":
            q += f" and {measurement_scale} = '{int(period[5:])}'"
    else:
        from_seconds, to_seconds = start_end_period(period)
        q += f" where 1=1 and time >= {from_seconds}s and time < {to_seconds}s "

    q += f" and {config.log.sp_id} = '{sp_entity_id}'" if sp_entity_id else ""
    q += f" and {config.log.idp_id} = '{idp_entity_id}'" if idp_entity_id else ""

    records = _query(q, group_by=False, epoch=epoch)
    if needs_grouping:
        records = adjust_time(records, epoch)

    if include_unique:
        q = q.replace(f"from {measurement}",
                      f"from {measurement}_unique")
        unique_records = _query(q, group_by=False, epoch=epoch)
        if needs_grouping:
            unique_records = adjust_time(unique_records, epoch)
        records.extend(unique_records)
    return remove_aggregated_time_info(records)
