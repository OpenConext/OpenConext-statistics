// Interpolation works as follows:
//
// Make a key with the translation and enclose the variable with {{}}
// ie "Hello {{name}}" Do not add any spaces around the variable name.
// Provide the values as: I18n.t("key", {name: "John Doe"})
import I18n from "i18n-js";

I18n.translations.nl = {
    code: "NL",
    name: "Nederlands",
    select_locale: "Selecteer Nederlands",

    header: {
        title: "Statistics",
        links: {
            help_html: "<a href=\"https://wiki.surfnet.nl/pages/viewpage.action?pageId=35422637\" target=\"_blank\">Help</a>",
            logout: "Logout",
            exit: "Exit"
        },
        role: "Role"
    },

    navigation: {
        overview: "Overzicht",
        idps: "Instellingen",
        sps: "Diensten",
        advanced: "Geavanceerd"
    },

    error_dialog: {
        title: "Onverwachte fout",
        body: "Dit is genant; een onverwachte fout is opgetreden. De fout is geraporteerd. Probeer het aub opnieuw..",
        ok: "Close"
    },
    period: {
        title: "Periode",
        scale: "Tijdsduur",
        from: "Van",
        to: "Tot"
    },
};

export default I18n.translations.nl;
