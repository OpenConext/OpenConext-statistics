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
            login: "Login",
            exit: "Exit"
        },
        role: "Role"
    },
    advanced: {
        newcomers: {
            title: "Alle nieuwe {{provider}} van {{from}} tot {{to}}"
        },
        unused: {
            title: "Alle niet gebruikte {{provider}} van {{from}} tot {{to}}"
        }
    },
    providerTable: {
        newcomersNoResults: "Geen first-logins gevonden voor de providers in de opgegeven periode.",
        unusedNoResults: "Geen ongebruikte providers gevonden in de opgegeven periode.",
        name: "Name",
        logins: "Number of logins",
        newcomers: "Eerste login",
        unused: "Laatste login",
        state: "State",
        noTime: "Nooit"
    },
    navigation: {
        live: "Stats",
        overview: "Overzicht",
        connected_identity_providers: "Instellingen",
        system: "Explore",
        db: "DB"
    },
    db: {
        title: "Alle measurements in {{db}}. De live measurement is {{measurement}}. Ophalen van de data duurde ~{{time}} seconden.",
        loading: "Ophalen metadata. Dit duurt lang...",
        name: "Naam",
        records: "# Series",
        timeout: "Timeout"
    },
    export: {
        downloadCSV: "Download als CSV",
        downloadPNG: "Download als PNG",
        downloadPDF: "Download als PDF"
    },
    index: {
        availability: "Beschikbaarheid SURFconext",
        connectedIdentityProviders: "List of connected Identity GroupBy",
    },
    providers: {
        title: "Instellingen",
        sp: "Diensten",
        institution_type: "Type instelling",
        idp: "Instellingen",
        all: {
            sp: "Alle Diensten",
            idp: "Alle Instellingen",
            idp_type: "Alle types"
        },
        aggregate: "Aggregeer",
        groupBy: "Groepeer per {{type}}",
        matrix: "Download IdP-SP matrix",
        scale: {
            title: "Groepeer per periode",
            none: "Geen",
            html: "Gebruik dit om te groeperen bij een sub-periode.<br/>Dit kan alleen als je eerst groepeert per dienst of instelling<br/> en dan vervolgens een specieke dienst of instelling selecteert in de Filters sectie"
        }
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
        date: "Datum",
        noTimeFrame: "Geen tijdsspanne",
        noTimeFrameTooltip: "Gebruik dit om het aantal unieke gebruikers in de gespecificeerde periode op te vragen.<br/>Dit is alleen mogelijk als er zowel dienst en instelling in de Filter sectie zijn geselecteerd.",
    },
    selectPeriod: {
        title: "Periode",
        subtitle: "Kies een periode",
        year: "Jaar - laatste 5 jaren",
        quarter: "Kwartaal - laatste 4 kwartalen",
        month: "Maand - laatste 12 maanden",
        day: "Day - laatste 90 dagen",
        hour: "Uur - laatste 7 dagen",
        minute: "Minuut - laatste 24 uur",
    },
    reporting: {
        title: "Reporting",
        newcomers: "Nieuwe providers",
        unused: "Ongebruikte providers"
    },
    managePresent: {
        title: "Manage",
        present: "Verberg diensten niet in Manage?"
    },
    chart: {
        title: "Logins en gebruikers per dag",
        chart: "Aantal ingelogde gebruikers per {{scale}}",
        userCount: "Totale logins",
        uniqueUserCount: "Unieke gebruikers",
        loading: "Data ophalen....",
        noResults: "Geen logins voor de opgegeven periode.",
        date: "Datum",
        logins: "Logins per {{scale}}",
        allLogins: "# Logins",
        uniqueLogins: "Unieke logins",
        sp: "Service",
        idp: "Institution"
    },
    clipboard: {
        copied: "Copied!",
        copy: "Copy to clipboard"
    },
    live: {
        chartTitle: "Logins van {{from}} tot {{to}} gegroepeerd op {{scale}}",
        aggregatedChartTitlePeriod: "Logins in de periode {{period}} gegroepeerd op {{group}}",
        noTimeFrameChart: "Logins van {{from}} tot {{to}}"
    },
    filters: {
        title: "Filters",
        state: "Provider status",
        stateValues: {
            all: "Alle",
            prodaccepted: "prodaccepted",
            testaccepted: "testaccepted"
        },
        provider: "Entity type",
        providerValues: {
            sp: "Service Providers",
            idp: "Identity Providers"
        },
        uniques: "Inclusief unieke gebruikers"
    },

    eduGain: {
        loading: "Laden...",
        title: "Instellingen",
        info: "De volgende instellingen zijn leden van de SURFconext federatie. De eduGAIN kolom geeft weer of the instelling ook gepubliceerd is in <a href=\"https://wiki.surfnet.nl/display/surfconextdev/International+collaboration+through+eduGAIN\" target=\"_blank\">eduGAIN.</a>",
        organizationName: "Organisatie naam",
        surfConext: "SURFconext",
        eduGAIN: "EduGAIN",
        total: "Totaal",
        totalNonMembers: "Totaal: {{count}} non-member / gast organisaties",
        guest: "non-member / gast organisaties",
        nonMember: "non-member instelling",
        notFullMembers: "Een aantal instellingen beschikbaar in SURFconext zijn geen volwaardige leden van de federatie. De volgende instellingen gebruiken slechts een gelimiteerd aantal diensten - welke verschilt per instelling. Ze worden niet gepubliceerd in eduGAIN.",
        footer: "De technische details van de verbonden instellingen is beschikbaar <a href=\"https://engine.surfconext.nl/\" target=\"_blank\">in de SURFconext metadata</a>. Voor meer informatie over SURFconext zie <a href=\"https://www.surfconext.nl/\" target=\"_blank\">www.surfconext.nl</a>."
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
