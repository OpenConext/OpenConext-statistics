// Interpolation works as follows:
//
// Make a key with the translation and enclose the variable with {{}}
// ie "Hello {{name}}" Do not add any spaces around the variable name.
// Provide the values as: I18n.t("key", {name: "John Doe"})
import I18n from "../locale/I18n";

const en = {
    code: "EN",
    name: "English",
    select_locale: "Select English",

    header: {
        title: "Statistics",
        OpenConext: "Statistics",
        SURFConext: "Statistics",
        links: {
            login: "Login",
            exit: "Exit"
        },
        role: "Role"
    },
    advanced: {
        newcomers: {
            title: "All new {{provider}} for which a first login has been recorded between {{from}} until {{to}}"
        },
        unused: {
            title: "All {{provider}} that were NOT used after {{from}}"
        },
    },
    providerTable: {
        newcomersNoResults: "No first-logins found for providers in the specified period.",
        unusedNoResults: "No unused providers found in the specified period.",
        name: "Name",
        logins: "Number of logins",
        newcomers: "First login",
        unused: "Last login",
        state: "State",
        noTime: "Never"
    },
    navigation: {
        live: "Stats",
        overview: "Overview",
        connected_identity_providers: "Institutions",
        system: "Explore",
        db: "Measurements",
        animations: "High Scores"
    },
    db: {
        title:"All measurements from database {{db}}. The live measurement is named {{measurement}}. Loading took ~{{time}} seconds.",
        loading: "Fetch metadata. This takes time...",
        name: "Name",
        records: "# Series",
        timeout: "Timeout"
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
        title: "Group By",
        sp: "Services",
        institution_type: "Institution type",
        idp: "Institutions",
        all: {
            sp: "All Services",
            idp: "All Institutions",
            idp_type: "All types"
        },
        aggregate: "Aggregate",
        groupBy: "Group by {{type}}",
        matrix: "Download IdP-SP matrix",
        scale: {
            title: "Group by period",
            none: "None",
            html: "Use this to group by a sub-period.<br/>This is only possible if you first group by either Services or Institutions<br/>and then select either a specific Service or Institution in the Filter section"
        }
    },
    period: {
        title: "Period",
        scale: "Timeframe",
        from: "From",
        to: "Up to and including",
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
        date: "Date",
        noTimeFrame: "No timeframe",
        noTimeFrameTooltip: "Select this to get the count of total unique users in the specified period.<br/>This is only possible if you both select a Service and Institution in the Filter section",
    },
    selectPeriod: {
        title: "Period",
        subtitle: "Choose a period",
        year: "Year - last 5 years",
        quarter: "Quarter - last 4 quarters",
        month: "Month - last 12 months",
        week: "Week - last 52 weeks",
        day: "Day - last 90 days",
        hour: "Hour - last 7 days",
        minute: "Minute - last 24 hours",
    },
    reporting: {
        title: "Reporting",
        newcomers: "New providers",
        unused: "Unused providers"
    },
    managePresent: {
        title: "Manage",
        present: "Hide not present in Manage?"
    },
    chart: {
        title: "Logins and users per day",
        chart: "Number of logins per {{scale}}",
        userCount: "Total logins",
        uniqueUserCount: "Unique users",
        loading: "Fetching logins....",
        noResults: "No logins are recorded for the given period and specified filters.",
        reset: "Reset to defaults.",
        date: "Date",
        logins: "Logins per {{scale}}",
        allLogins: "# Logins",
        uniqueLogins: "Unique logins",
        sp: "Service",
        idp: "Institution"
    },
    clipboard: {
        copied: "Copied!",
        copy: "Copy to clipboard"
    },
    live: {
        chartTitle: "Logins per {{scale}} {{institutionType}}",
        aggregatedChartTitlePeriod: "Logins in the period {{period}} per {{group}} {{institutionType}}",
        noTimeFrameChart: "Logins from {{from}} until {{to}} {{institutionType}}",
        institutionType: "for institution type '{{institutionType}}'"
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
        footer: "For technical details about connected IdPs please refer to <a href=\"https://engine.surfconext.nl/\" target=\"_blank\">our IdPs metadata</a>. For more information about SURFconext please see <a href=\"https://www.surfconext.nl/\" target=\"_blank\">www.surfconext.nl</a>.",
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

export default en;

