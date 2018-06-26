const dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

function isLeapYear(year) {
    if ((year & 3) !== 0) {
        return false;
    }
    return ((year % 100) !== 0 || (year % 400) === 0);
}

export function getDayOffYear(today) {
    const month = today.getUTCMonth();
    const day = today.getUTCDate();

    let dayOfYear = dayCount[month] + day;
    if (month > 1 && isLeapYear(today.getUTCFullYear())) {
        dayOfYear++;
    }
    return dayOfYear;
}
