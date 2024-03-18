import React from "react";
import I18n from "../locale/I18n";
import Cookies from "js-cookie";
import {replaceQueryParameter} from "../utils/QueryParameters";
import {stop} from "../utils/Utils";

import "./LanguageSelector.scss"
import PropTypes from "prop-types";

export default class LanguageSelector extends React.PureComponent {

    handleChooseLocale = locale => e => {
        stop(e);
        Cookies.set("lang", locale, {expires: 356, secure: document.location.protocol.endsWith("https")});
        I18n.locale = locale;
        window.location.search = replaceQueryParameter(window.location.search, "lang", locale);
    };

    renderLocaleChooser(locale) {
        return (
            <li key={locale} className={`language ${I18n.locale === locale ? "active" : ""}`}>
                <a title={I18n.t("select_locale", {locale: locale})}
                   onClick={this.handleChooseLocale(locale)}>
                    {I18n.t("code", {locale: locale})}
                </a>
            </li>
        );
    }

    render() {
        const currentUser = this.props.currentUser;
        const languageCodes = currentUser.supported_language_codes.split(",").map(s => s.trim());
        return (
            <ul className="language-selector">
                {languageCodes.map(code => this.renderLocaleChooser(code))}
            </ul>
        );
    }
}

LanguageSelector.propTypes = {
    currentUser: PropTypes.object.isRequired
};
