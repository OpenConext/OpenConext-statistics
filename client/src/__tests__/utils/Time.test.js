import {getPeriod, addDayDuplicates} from "../../utils/Time";
import moment from "moment";
import data from "./tooltip.bug.json";

function doTest(year, month, day, scale, expected) {
    const period = getPeriod(moment(new Date(year, month, day)), scale);
    expect(period).toBe(expected);
}

test("Day", () => doTest(2017, 6, 1, "day", "2017D182"));

test("Week", () => doTest(2017, 0, 1, "week", "2017W1"));

test("Week", () => doTest(2017, 11, 28, "week", "2017W52"));

test("Month", () => doTest(2017, 0, 1, "month", "2017M1"));

test("Quarter", () => doTest(2016, 11, 31, "quarter", "2016Q4"));

test("Year", () => doTest(2017, 11, 31, "year", "2017"));

test("None", () => doTest(2017, 11, 31, "minute", undefined));

test("addDayDuplicates", () => {
    expect(data.length).toBe(38);
    const duplicatedItems = data.filter(item => item.time === 1548892800000);
    expect(duplicatedItems.length).toBe(2);

    const added = addDayDuplicates(data);
    expect(added.length).toBe(37);
    const addedItem = added.filter(item => item.time === 1548892800000)[0];
    expect(addedItem.count_user_id).toBe(duplicatedItems[0].count_user_id + duplicatedItems[1].count_user_id);
    expect(addedItem.distinct_count_user_id).toBe(duplicatedItems[0].distinct_count_user_id + duplicatedItems[1].distinct_count_user_id);

});