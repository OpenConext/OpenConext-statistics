from datetime import datetime

epoch = datetime.utcfromtimestamp(0)


def unix_time_seconds(dt):
    return int((dt - epoch).total_seconds())


def month_start_end_seconds(month_number):
    return 0