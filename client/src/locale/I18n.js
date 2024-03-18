import en from "./en";
import nl from "./nl";
import pt from "./pt";

import {I18n as I18nRemote} from "i18n-js";

import {getParameterByName} from "../utils/QueryParameters";
import {isEmpty} from "../utils/Utils";
import Cookies from "js-cookie";

const I18n = new I18nRemote({
    en: en,
    nl: nl,
    pt: pt
});

// DetermineLanguage based on parameter, cookie and finally navigator
let parameterByName = getParameterByName("lang", window.location.search);

if (isEmpty(parameterByName)) {
    parameterByName = Cookies.get("lang");
}

if (isEmpty(parameterByName)) {
    parameterByName = navigator.language.toLowerCase().substring(0, 2);
}
if (["nl", "en"].indexOf(parameterByName) === -1) {
    parameterByName = "en";
}
I18n.locale = parameterByName;

export default I18n;
