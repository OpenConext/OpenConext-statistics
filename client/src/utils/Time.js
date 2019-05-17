import I18n from "i18n-js";
import {groupBy} from "./Utils";

export function getPeriod(m, scale) {
    switch (scale) {
        case "day":
            return `${m.year()}D${m.dayOfYear()}`;
        case "week":
            return `${m.year()}W${m.week()}`;
        case "month":
            return `${m.year()}M${m.month() + 1}`;
        case "quarter":
            return `${m.year()}Q${m.quarter()}`;
        case "year":
            return `${m.year()}`;
        default:
            return undefined;
    }
}

export function getDateTimeFormat(scale, forceDayFormat = false) {
    if (forceDayFormat) {
        return "L";
    }
    switch (scale) {
        case "day":
            return "L";
        case "week":
            return `YYYY [week] ww`;
        case "month":
            return "YYYY MMMM";
        case "quarter":
            return "YYYY [Q]Q";
        case "year":
            return `[${I18n.t("period.year")}] YYYY`;
        default:
            return "L";
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
            return arr.reduce((acc, item)=> {
                acc.time = item.time;
                acc.count_user_id = item.count_user_id + (acc.count_user_id || 0);
                acc.distinct_count_user_id = item.distinct_count_user_id + (acc.distinct_count_user_id || 0);
                return acc;
            },{});
        }
        return arr[0];
    })
}