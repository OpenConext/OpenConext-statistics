// Interpolation works as follows:
//
// Make a key with the translation and enclose the variable with {{}}
// ie "Hello {{name}}" Do not add any spaces around the variable name.
// Provide the values as: I18n.t("key", {name: "John Doe"})
import I18n from "i18n-js";

I18n.translations.en = {
    code: "EN",
    name: "English",
    select_locale: "Select English",
    todo: "Not implemented yet....",

    header: {
        title: "Statistics",
        OpenConext: "OpenConext Statistics",
        SURFConext: "SURFConext Statistics",
        links: {
            help_html: "<a href=\"https://github.com/OpenConext/OpenConext-statistics\" target=\"_blank\">Help</a>",
            logout: "Logout",
            exit: "Exit"
        },
        role: "Role"
    },

    navigation: {
        overview: "Overview",
        idps: "Institutions",
        sps: "Services",
        advanced: "Advanced"
    },

    index: {
        public: "Public",
        availability: "Availability SURFconext",
        live: "Live usage statistics",
        connectedIdentityProviders: "List of connected Identity Providers",
        surfOnly: "SURF only",
        dashboard: "Statistics Overview"
    },
    providers: {
        title: "Providers",
        sp: "Services",
        idp:"Institutions",
        all: {
            sp: "All Services",
            idp: "All Institutions"
        }
    },
    period: {
        title: "Period",
        scale: "Timeframe",
        from: "From",
        to: "To",
        today: "Today",
        year: "Year",
        quarter: "Quarter",
        month: "Month",
        week: "Week",
        day: "Day",
        hour: "Hour",
        minute: "Minute"
    },
    chart: {
        title: "Logins and users per day",
        userCount: "Total logins",
        uniqueUserCount: "Unique users",
        loading: "Fetching logins....",
        noResults: "No logins are recorded for the given period.",
        date: "Datum",
        logins: "Logins per {{scale}}"
    },
    live : {
        chartTitle: "Total logins per {{scale}}"
    },
    error_dialog: {
        title: "Unexpected error",
        body: "This is embarrassing; an unexpected error has occurred. It has been logged and reported. Please try again. Still doesn't work? Please click 'Help'.",
        ok: "Close"
    },
    not_found: {
        title: "404",
        description_html: "The requested page could not be found"
    },
    server_error: {
        title: "500 Unexpected error",
    }


};

export default I18n.translations.nl;
