import I18n from "../locale/I18n";
import {groupBy} from "./Utils";
import {DateTime} from "luxon";

const dayOfYear = date => {
    return DateTime.fromJSDate(date).ordinal
}

const weekOfYear = date => {
    return DateTime.fromJSDate(date).weekNumber
};

const monthOfYear = date => date.getMonth() + 1;

const quarterOfYear = date => Math.ceil((date.getMonth() + 1) / 3);

export function getPeriod(date, scale) {
    switch (scale) {
        case "day":
            return `${date.getFullYear()}D${dayOfYear(date)}`;
        case "week":
            return `${date.getFullYear()}W${weekOfYear(date)}`;
        case "month":
            return `${date.getFullYear()}M${monthOfYear(date)}`;
        case "quarter":
            return `${date.getFullYear()}Q${quarterOfYear(date)}`;
        case "year":
            return `${date.getFullYear()}`;
        default:
            return undefined;
    }
}

//See https://moment.github.io/luxon/#/formatting?id=table-of-tokens
export function getDateTimeFormat(scale, forceDayFormat = false, adjustForDateFormat = false) {
    if (forceDayFormat) {
        return "yyyy-LL-dd";
    }
    switch (scale) {
        case "minute":
        case "hour":
            return "yyyy-LL-dd hh:mm"
        case "day":
            return "yyyy-LL-dd";
        case "week":
            return adjustForDateFormat ? `yyyy 'W'W` : `yyyy 'W'w`;
        case "month":
            return "yyyy 'M'L";
        case "quarter":
            return "yyyy 'Q'q";
        case "year":
            return `'${I18n.t("period.year")}' yyyy`;
        default:
            return "yyyy-LL-dd";
    }
}

export function getGroupByPeriod(scale) {
    switch (scale) {
        case "day":
            return [];
        case "week":
            return ["day"];
        case "month":
            return ["day", "week"];
        case "quarter":
            return ["day", "week", "month"];
        case "year":
            return ["day", "week", "month", "quarter"];
        default:
            return [];
    }
}

export const defaultScales = ["year", "quarter", "month", "week", "day", "hour", "minute"];

export const allowedAggregatedScales = ["year", "quarter", "month", "week", "day"];

export function addDayDuplicates(data) {
    const groupedByTime = groupBy(data, "time");
    return Object.values(groupedByTime).map(arr => {
        if (arr.length > 1) {
            return arr.reduce((acc, item) => {
                acc.time = item.time;
                acc.count_user_id = item.count_user_id + (acc.count_user_id || 0);
                acc.distinct_count_user_id = item.distinct_count_user_id + (acc.distinct_count_user_id || 0);
                return acc;
            }, {});
        }
        return arr[0];
    })
}

export function addDays(numberOfDaysToAdd) {
    const now = new Date();
    now.setDate(now.getDate() + numberOfDaysToAdd);
    return now;
}

export function unixFromDate(date) {
    return Math.round(date.getTime() / 1000)
}

export function unixFromDateTime(dateTime) {
    return Math.round(dateTime.toMillis() / 1000)
}

export function daysBetween(from, to) {
    const millis = to.getTime() - from.getTime();
    return Math.abs(Math.round(millis / (1000 * 3600 * 24)));
}
