import React from "react";
import I18n from "i18n-js";
import Cookies from "js-cookie";
import {replaceQueryParameter} from "../utils/QueryParameters";
import {stop} from "../utils/Utils";
import moment from "moment";
import "./LanguageSelector.css"

export default class LanguageSelector extends React.PureComponent {

    handleChooseLocale = locale => e => {
        stop(e);
        Cookies.set("lang", locale, {expires: 356, secure: document.location.protocol.endsWith("https")});
        I18n.locale = locale;
        moment.locale(locale);
        window.location.search = replaceQueryParameter(window.location.search, "lang", locale);
    };

    renderLocaleChooser(locale) {
        return (
            <li key={locale} className={`language ${I18n.currentLocale() === locale ? "active" : ""}`}>
                <a title={I18n.t("select_locale", {locale: locale})}
                   onClick={this.handleChooseLocale(locale)}>
                    {I18n.t("code", {locale: locale})}
                </a>
            </li>
        );
    }

    render() {
        return (
            <ul className="language-selector">
                {[
                    this.renderLocaleChooser("en"),
                    this.renderLocaleChooser("nl")
                ]}
            </ul>
        );
    }

}