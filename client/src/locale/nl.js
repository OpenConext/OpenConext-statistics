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
            help_html: "<a href=\"https://github.com/OpenConext/OpenConext-statistics/wiki\" target=\"_blank\">Help</a>",
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
        groupBy: "Groepeer"
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
    error_dialog: {
        title: "Onverwachte fout",
        body: "Dit is gênant; er is een onverwachte fout opgetreden. De fout is gerapporteerd. Probeer het nogmaals. Blijft de fout aan? Klik op 'Help'.",
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
