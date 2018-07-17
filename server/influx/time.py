import datetime
from itertools import groupby

from dateutil import tz
from isoweek import Week


def day_start_end_seconds(year_number, day_number):
    start = datetime.datetime(year_number, 1, 1, tzinfo=tz.tzutc()) + datetime.timedelta(day_number - 1)
    end = start + datetime.timedelta(1)
    return int(start.timestamp()), int(end.timestamp())


def month_start_end_seconds(year_number, month_number):
    dt_begin_of_month = datetime.datetime(year=year_number, month=month_number, day=1, tzinfo=tz.tzutc())
    not_december = month_number < 12
    dt_end_of_month = datetime.datetime(year=year_number if not_december else year_number + 1,
                                        month=month_number + 1 if not_december else 1,
                                        day=1, tzinfo=tz.tzutc())
    return int(dt_begin_of_month.timestamp()), int(dt_end_of_month.timestamp())


def week_start_end_seconds(year_number, week_number):
    week_start = Week(year_number, week_number)
    week_end = Week(year_number if week_number < 52 else year_number + 1,
                    week_number + 1 if week_number < 52 else 1)
    time = datetime.datetime.min.time()
    return (int(datetime.datetime.combine(week_start.monday(), time, tzinfo=tz.tzutc()).timestamp()),
            int(datetime.datetime.combine(week_end.monday(), time, tzinfo=tz.tzutc()).timestamp()))


def quarter_start_end_seconds(year_number, quarter):
    start_month = 1 + ((quarter - 1) * 3)
    not_q4 = quarter < 4
    end_month = start_month + 3 if not_q4 else 1
    start = month_start_end_seconds(year_number, start_month)
    end = month_start_end_seconds(year_number if not_q4 else year_number + 1, end_month)
    return start[0], end[0]


def year_start_end_seconds(year_number):
    return int(datetime.datetime(year_number, 1, 1, tzinfo=tz.tzutc()).timestamp()), \
           int(datetime.datetime(year_number + 1, 1, 1, tzinfo=tz.tzutc()).timestamp())


# Valid periods are day, week, month, quarter and year
def start_end_period(period):
    periods = {"d": day_start_end_seconds, "w": week_start_end_seconds, "m": month_start_end_seconds,
               "q": quarter_start_end_seconds}
    year = int(period[0:4])
    if len(period) == 4:
        return year_start_end_seconds(year)
    return periods[period[4:5].lower()](year, int(period[5:]))


def _month_quarter_year_to_start(epoch):
    def it(point):
        month = point.get("month", None)
        quarter = point.get("quarter", None)
        year = point.get("year", None)
        res = None
        if month:
            res = datetime.datetime(year=int(year), month=int(month), day=1, tzinfo=tz.tzutc())
        elif quarter:
            res = datetime.datetime(year=int(year), month=1 + ((int(quarter) - 1) * 3), day=1, tzinfo=tz.tzutc())
        elif year:
            res = datetime.datetime(year=int(year), month=1, day=1, tzinfo=tz.tzutc())
        if res:
            point["utc_seconds"] = int(res.timestamp())
            point["time"] = int(res.timestamp() * 1000) if epoch else res.strftime("%Y-%m-%dT%H:%M:%SZ")
        return point

    return it


def filter_time(from_seconds, to_seconds, records):
    return list(filter(lambda p: from_seconds <= p["utc_seconds"] < to_seconds, records))


def adjust_time(points, epoch):
    if len(points) == 0:
        return points
    res = list(map(_month_quarter_year_to_start(epoch), points))
    res.sort(key=lambda point: point["utc_seconds"])
    return res


def remove_aggregated_time_info(points):
    for p in points:
        p.pop("year", None)
        p.pop("quarter", None)
        p.pop("month", None)
        p.pop("utc_seconds", None)
    return points


def combine_time_duplicates(records):
    res = groupby(records, key=lambda p: p["time"])
    return [{"time": k, "count_user_id": sum(map(lambda p: p["count_user_id"], v))} for k, v in res]
