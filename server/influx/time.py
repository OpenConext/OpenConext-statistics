import datetime

from dateutil import tz


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
    def week_start(year, week):
        fourth_jan = datetime.datetime(year=year, month=1, day=4, tzinfo=tz.tzutc())
        _, fourth_jan_week, fourth_jan_day = fourth_jan.isocalendar()
        d = fourth_jan + datetime.timedelta(days=1 - fourth_jan_day, weeks=week - fourth_jan_week)
        return int(d.timestamp())

    return week_start(year_number, week_number), week_start(year_number, week_number + 1)


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
            point["time"] = int(res.timestamp() * 1000) if epoch else res.strftime("%Y-%m-%dT%H:%M:%SZ")
        return point
    return it


def adjust_time(points, epoch):
    if len(points) == 0:
        return points
    res = list(map(_month_quarter_year_to_start(epoch), points))
    res.sort(key=lambda point: point["time"])
    return res
