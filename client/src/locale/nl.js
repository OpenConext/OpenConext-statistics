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

    todo: "Nog niet geimplementeerd....",

    header: {
        title: "Statistieken",
        OpenConext: "OpenConext Statistieken",
        SURFConext: "SURFConext Statistieken",
        links: {
            logout: "Uitloggen",
            exit: "Exit"
        },
        role: "Rol"
    },

    navigation: {
        live: "Stats",
        overview: "Overzicht",
        connected_identity_providers: "Instellingen",
    },
    export: {
        downloadCSV: "Download als CSV",
        downloadPNG: "Download als PNG",
        downloadPDF: "Download als PDF"
    },

    index: {
        availability: "Beschikbaarheid SURFconext",
        connectedIdentityProviders: "List of connected Identity Providers",
    },

    providers: {
        title: "Instellingen",
        sp: "Diensten",
        idp: "Instellingen",
        all: {
            sp: "Alle Diensten",
            idp: "Alle Instellingen"
        },
        aggregate: "Aggregeer",
        groupBy: "Groepeer per {{type}}"
    },
    period: {
        title: "Periode",
        scale: "Tijdsspanne",
        from: "Van",
        to: "Tot",
        zoom: "",
        today: "Vandag",
        year: "Jaar",
        quarter: "Kwartaal",
        month: "Maand",
        week: "Week",
        day: "Dag",
        hour: "Uur",
        minute: "Minuut",
        none: "N/A",
        date: "Datum"
    },
    chart: {
        title: "Logins en gebruikers per dag",
        userCount: "Totale logins",
        uniqueUserCount: "Unieke gebruikers",
        loading: "Data ophalen....",
        noResults: "Geen logins voor de opgegeven periode.",
        date: "Datum",
        logins: "Logins per {{scale}}",
        allLogins: "Totale logins",
        uniqueLogins: "Unieke logins"
    },
    live: {
        chartTitle: "Totale logins van {{from}} tot {{to}} gegroepeerd op {{scale}}",
        aggregatedChartTitle: "Geaggregeerde logins van {{from}} tot {{to}}",
        aggregatedChartTitlePeriod: "Geaggregeerde logins in de periode {{period}}"
    },
    filters: {
        title: "Filters",
        state: "Provider status",
        stateValues: {
            all: "Alle",
            prodaccepted: "prodaccepted",
            testaccepted: "testaccepted"
        },
        uniques: "Inclusief unieke gebruikers"
    },

    eduGain: {
        loading: "Loading...",
        title: "Identity providers",
        info: "The following organizations are members of the SURFconext federation. The eduGAIN column indicates whether the organization is also available in <a href=\"https://wiki.surfnet.nl/display/surfconextdev/International+collaboration+through+eduGAIN\" target=\"_blank\">eduGAIN.</a>",
        organizationName: "Organization name",
        surfConext: "SURFconext",
        eduGAIN: "EduGAIN",
        total: "Totaal",
        totalNonMembers: "Total: {{count}} non-member / guest organizations",
        guest: "non-member / guest organizations",
        nonMember: "non-member IdP",
        notFullMembers: "There are a number of Identity Providers available in SURFconext that are not full members of the federation. The following IdPs and organization can only use a limited set of services (which set may differ per IdP). They will not be published in eduGAIN.",
        footer: "For technical details about connected IdPs please refer to <a href=\"https://engine.surfconext.nl/\" target=\"_blank\">our IdPs metadata</a>. For more information about SURFconext please see www.surfconext.nl."
    },

    error_dialog: {
        title: "Onverwachte fout",
        body: "Dit is gênant; er is een onverwachte fout opgetreden. De fout is gerapporteerd. Probeer het nogmaals...",
        ok: "Sluiten"
    },
    not_found: {
        title: "404",
        description_html: "Deze pagina kan niet worden gevonden."
    },
    server_error: {
        title: "500 Onverwachte fout",
    }


};

export default I18n.translations.nl;
