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

export function getDateTimeFormat(scale) {
    switch (scale) {
        case "day":
            return "L";
        case "week":
            return "YYYY ww";
        case "month":
            return "YYYY MMMM";
        case "quarter":
            return "YYYY qQ";
        case "year":
            return "YYYY";
        default:
            return "LLL";
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

