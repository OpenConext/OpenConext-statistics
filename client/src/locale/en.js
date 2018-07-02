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
            help_html: "<a href=\"https://github.com/OpenConext/OpenConext-statistics/wiki\" target=\"_blank\">Help</a>",
            logout: "Logout",
            exit: "Exit"
        },
        role: "Role"
    },

    navigation: {
        live: "Stats",
        overview: "Overview",
        connected_identity_providers: "Institutions",
    },

    index: {
        availability: "Availability SURFconext",
        connectedIdentityProviders: "List of connected Identity Providers",
    },
    providers: {
        title: "Providers",
        sp: "Services",
        idp: "Institutions",
        all: {
            sp: "All Services",
            idp: "All Institutions"
        },
        aggregate: "Aggregate",
        groupBy: "Group by"
    },
    period: {
        title: "Period",
        scale: "Timeframe",
        from: "From",
        to: "To",
        today: "Today",
        zoom: "",
        year: "Year",
        quarter: "Quarter",
        month: "Month",
        week: "Week",
        day: "Day",
        hour: "Hour",
        minute: "Minute",
        none: "N/A",
        date: "Date"
    },
    chart: {
        title: "Logins and users per day",
        userCount: "Total logins",
        uniqueUserCount: "Unique users",
        loading: "Fetching logins....",
        noResults: "No logins are recorded for the given period.",
        date: "Date",
        logins: "Logins per {{scale}}",
        allLogins: "Total logins",
        uniqueLogins: "Unique logins"
    },
    live: {
        chartTitle: "Total logins from {{from}} until {{to}} grouped by {{scale}}",
        aggregatedChartTitle: "Aggregated logins from {{from}} until {{to}}",
        aggregatedChartTitlePeriod: "Aggregated logins for the period {{period}}"
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

export default I18n.translations.en;
