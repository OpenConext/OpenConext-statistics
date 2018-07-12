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
            logout: "Logout",
            exit: "Exit"
        },
        role: "Role"
    },
    advanced: {
        newcomers: {
            title: "All new {{provider}} from {{from}} until {{to}}"
        },
        notused: {
            title: "All not used {{provider}} from {{from}} until {{to}}"
        },
    },
    providerTable: {
        noResults: "No first-logins found for providers in the given period.",
        name: "Name",
        logins: "Number of logins",
        date: "Date",
        state: "State"
    },
    navigation: {
        live: "Stats",
        overview: "Overview",
        connected_identity_providers: "Institutions",
        system: "System"
    },
    export: {
        downloadCSV: "Download as CSV",
        downloadPNG: "Download as PNG",
        downloadPDF: "Download as PDF"
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
        groupBy: "Group by {{type}}"
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
        allLogins: "# Logins",
        uniqueLogins: "Unique logins"
    },
    live: {
        chartTitle: "Total logins from {{from}} until {{to}} grouped by {{scale}}",
        aggregatedChartTitle: "Aggregated logins from {{from}} until {{to}}",
        aggregatedChartTitlePeriod: "Aggregated logins for the period {{period}}"
    },
    filters: {
        title: "Filters",
        state: "Provider status",
        stateValues: {
            all: "All",
            prodaccepted: "prodaccepted",
            testaccepted: "testaccepted"
        },
        provider: "Entity type",
        providerValues: {
            sp: "Service Providers",
            idp: "Identity Providers"
        },
        uniques: "Include unique user count"
    },
    eduGain: {
        loading: "Loading...",
        title: "Identity providers",
        info: "The following organizations are members of the SURFconext federation. The eduGAIN column indicates whether the organization is also available in <a href=\"https://wiki.surfnet.nl/display/surfconextdev/International+collaboration+through+eduGAIN\" target=\"_blank\">eduGAIN.</a>",
        organizationName: "Organization name",
        surfConext: "SURFconext",
        eduGAIN: "EduGAIN",
        total: "Total: {{count}} organizations",
        totalNonMembers: "Total: {{count}} non-member / guest organizations",
        guest: "non-member / guest organizations",
        nonMember: "non-member IdP",
        notFullMembers: "There are a number of Identity Providers available in SURFconext that are not full members of the federation. The following IdPs and organization can only use a limited set of services (which set may differ per IdP). They will not be published in eduGAIN.",
        footer: "For technical details about connected IdPs please refer to <a href=\"https://engine.surfconext.nl/\" target=\"_blank\">our IdPs metadata</a>. For more information about SURFconext please see www.surfconext.nl.",
    },
    error_dialog: {
        title: "Unexpected error",
        body: "This is embarrassing; an unexpected error has occurred. It has been logged and reported. Please try again...",
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
