import React from "react";
import ReactDOM from "react-dom";
import App from "./pages/App";
import {getParameterByName} from "./utils/QueryParameters";
import {isEmpty} from "./utils/Utils";
import moment from "moment-timezone";
import I18n from "i18n-js";
import Cookies from "js-cookie";
import * as HighChart from "highcharts";
import * as HighStock from "highcharts/highstock"

(() => {
    // DetermineLanguage based on parameter, cookie and finally navigator
    let parameterByName = getParameterByName("lang", window.location.search);

    if (isEmpty(parameterByName)) {
        parameterByName = Cookies.get("lang");
        parameterByName = isEmpty(parameterByName) ? "en" : parameterByName;
    }

    if (isEmpty(parameterByName)) {
        const lang = navigator.language.toLowerCase();
        parameterByName = lang.startsWith("en") ? "en" : lang.startsWith("nl") ? "nl" : undefined;
    }

    I18n.locale = parameterByName;
    moment.locale(I18n.locale);
    // moment.tz.setDefault("Greenwich Mean Time");
    HighChart.setOptions({
        lang: {
            months: moment.months(),
            weekdays: moment.weekdays(),
            shortMonths: moment.monthsShort(),
            downloadCSV: I18n.t("export.downloadCSV"),
            downloadPNG: I18n.t("export.downloadPNG"),
            downloadPDF: I18n.t("export.downloadPDF"),
        },
        global: {useUTC: true,timezoneOffset: 5 * 60}
    });
    HighStock.setOptions({
        lang: {
            months: moment.months(),
            weekdays: moment.weekdays(),
            shortMonths: moment.monthsShort(),
            rangeSelectorFrom: I18n.t("period.from"),
            rangeSelectorTo: I18n.t("period.to"),
            rangeSelectorZoom: I18n.t("period.zoom"),
            downloadCSV: I18n.t("export.downloadCSV"),
            downloadPNG: I18n.t("export.downloadPNG"),
            downloadPDF: I18n.t("export.downloadPDF"),
        },
        global: {useUTC: true,timezoneOffset: 5 * 60}
    });
})();


ReactDOM.render(<App/>, document.getElementById("app"));
