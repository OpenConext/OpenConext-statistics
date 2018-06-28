import {getDayOffYear} from "../../utils/Time";

function doTest(year, month, day, expected) {
    const dayOfYear = getDayOffYear(new Date(Date.UTC(year, month, day)));
    expect(dayOfYear).toBe(expected);
}

test("Day of year", () => doTest(2017, 6, 1, 182));

test("Day of year start", () => doTest(2017, 0, 1, 1));

test("Day of year leap", () => doTest(2016, 11, 31, 366));

test("Day of year end", () => doTest(2017, 11, 31, 365));
