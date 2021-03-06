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
    let lang = getParameterByName("lang", window.location.search);

    if (isEmpty(lang)) {
        lang = Cookies.get("lang");
    }

    if (isEmpty(lang)) {
        lang = navigator.language.toLowerCase().substring(0, 2);
    }
    lang = ["en", "nl", "pt"].includes(lang) ? lang : "en";

    I18n.locale = lang || "en";
    moment.locale(I18n.locale);

    HighChart.setOptions({
        lang: {
            months: moment.months(),
            weekdays: moment.weekdays(),
            shortMonths: moment.monthsShort(),
            downloadCSV: I18n.t("export.downloadCSV"),
            downloadPNG: I18n.t("export.downloadPNG"),
            downloadPDF: I18n.t("export.downloadPDF"),
        }
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
        }
    });
})();


ReactDOM.render(<App/>, document.getElementById("app"));
