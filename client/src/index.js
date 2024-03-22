import App from "./pages/App";
import {getParameterByName} from "./utils/QueryParameters";
import {isEmpty} from "./utils/Utils";
import I18n from "./locale/I18n";
import "./locale/en";
import "./locale/nl";
import Cookies from "js-cookie";
import * as HighChart from "highcharts";
import * as HighStock from "highcharts/highstock"
import {Info} from "luxon";
import {createRoot} from "react-dom/client";
import "core-js/stable";
import "regenerator-runtime/runtime";
import {polyfill} from "es6-promise";
import React from 'react';

polyfill();

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
    const weekDays = Info.weekdays("long", {locale: I18n.locale});
    const months = Info.months("long", {locale: I18n.locale});
    const shortMonths = Info.months("short", {locale: I18n.locale});

    HighChart.setOptions({
        lang: {
            months: months,
            weekdays: weekDays,
            shortMonths: shortMonths,
            downloadCSV: I18n.t("export.downloadCSV"),
            downloadPNG: I18n.t("export.downloadPNG"),
            downloadPDF: I18n.t("export.downloadPDF"),
        }
    });
    HighStock.setOptions({
        lang: {
            months: months,
            weekdays: weekDays,
            shortMonths: shortMonths,
            rangeSelectorFrom: I18n.t("period.from"),
            rangeSelectorTo: I18n.t("period.to"),
            rangeSelectorZoom: I18n.t("period.zoom"),
            downloadCSV: I18n.t("export.downloadCSV"),
            downloadPNG: I18n.t("export.downloadPNG"),
            downloadPDF: I18n.t("export.downloadPDF"),
        }
    });
})();
const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App/>);
