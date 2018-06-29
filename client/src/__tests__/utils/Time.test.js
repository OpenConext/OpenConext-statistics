import {getPeriod} from "../../utils/Time";
import moment from "moment";

function doTest(year, month, day, scale, expected) {
    const period = getPeriod(moment(new Date(Date.UTC(year, month, day))), scale);
    expect(period).toBe(expected);
}

test("Day", () => doTest(2017, 6, 1, "day", "2017D182"));

test("Week", () => doTest(2017, 0, 1, "week", "2017W1"));

test("Week", () => doTest(2017, 11, 28, "week", "2017W52"));

test("Month", () => doTest(2017, 0, 1, "month", "2017M1"));

test("Quarter", () => doTest(2016, 11, 31, "quarter", "2016Q4"));

test("Year", () => doTest(2017, 11, 31, "year", "2017"));

test("None", () => doTest(2017, 11, 31, "minute", undefined));
