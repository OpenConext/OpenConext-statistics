import moment from "moment";

export function getDayOffYear(today) {
    return moment(today).dayOfYear()
}
