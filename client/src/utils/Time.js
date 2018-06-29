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
