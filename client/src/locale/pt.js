// Interpolation works as follows:
//
// Make a key with the translation and enclose the variable with {{}}
// ie "Hello {{name}}" Do not add any spaces around the variable name.
// Provide the values as: I18n.t("key", {name: "John Doe"})
import I18n from "i18n-js";

I18n.translations.pt = {
    code: "PT",
    name: "Português",
    select_locale: "Selecionar Português",

    header: {
        title: "Estatísticas",
        OpenConext: "Estatísticas",
        SURFConext: "Estatísticas",
        links: {
            login: "Entrar",
            exit: "Sair"
        },
        role: "Perfil"
    },
    advanced: {
        newcomers: {
            title: "Todos os novos {{provider}} para o qual um primeiro login foi registrado de {{from}} até {{to}}"
        },
        unused: {
            title: "Todos {{provider}} que NÃO foram usados depois {{from}}"
        },
    },
    providerTable: {
        newcomersNoResults: "Não foi encontrado nenhum primeiro-login para os provedores no período especificado.",
        unusedNoResults: "No unused providers found in the specified period.",
        name: "Nome",
        logins: "Número de logins",
        newcomers: "Primeiro login",
        unused: "Último login",
        state: "Estado",
        noTime: "Nunca"
    },
    navigation: {
        live: "Stats",
        overview: "Vista geral",
        connected_identity_providers: "Instituições",
        system: "Explore",
        db: "Medições",
        animations: "High Scores"
    },
    db: {
        title:"All measurements from database {{db}}. The live measurement is named {{measurement}}. Loading took ~{{time}} seconds.",
        loading: "A recolher os dados. Isto pode demorar algum tempo...",
        name: "Nome",
        records: "# Series",
        timeout: "Timeout"
    },
    export: {
        downloadCSV: "Download como CSV",
        downloadPNG: "Download como PNG",
        downloadPDF: "Download como PDF"
    },
    index: {
        availability: "Disponibilidade SURFconext",
        connectedIdentityProviders: "Lista de Provedores de Identidade ligados",
    },
    providers: {
        title: "Agrupar por",
        sp: "Serviços",
        institution_type: "Tipo de instituição",
        idp: "Instituições",
        all: {
            sp: "Todos os Serviços",
            idp: "Todas as Instituições",
            idp_type: "Todos os tipos"
        },
        aggregate: "Agregado",
        groupBy: "Agrupar por {{type}}",
        matrix: "Download da matriz dos IdP-SP",
        scale: {
            title: "Agrupar por período",
            none: "Nenhum",
            html: "Use this to group by a sub-period.<br/>This is only possible if you first group by either Services or Institutions<br/>and then select either a specific Service or Institution in the Filter section"
        }
    },
    period: {
        title: "Período",
        scale: "Prazo",
        from: "From",
        to: "Up to and including",
        today: "Hoje",
        zoom: "",
        year: "Ano",
        quarter: "Trimestre",
        month: "Mês",
        week: "Semana",
        day: "Dia",
        hour: "Hora",
        minute: "Minuto",
        none: "N/D",
        date: "Data",
        noTimeFrame: "No timeprazo",
        noTimeFrameTooltip: "Selecione isto para obter a contagem do total de usuários únicos no período especificado. <br/> Isso só é possível se você selecionar um Serviço e uma Instituição na seção Filtro",
    },
    selectPeriod: {
        title: "Período",
        subtitle: "Escolha um período",
        year: "Ano - últimos 5 anos",
        quarter: "Trimestre - últimos 4 trimestres",
        month: "Mês - últimos 12 meses",
        week: "Semana - últimas 52 semanas",
        day: "Dia - últimos 90 dias",
        hour: "Hora - últimos 7 dias",
        minute: "Minuto - últimas 24 horas",
    },
    reporting: {
        title: "Relatório",
        newcomers: "Novos provedores",
        unused: "Provedores não utilizados"
    },
    managePresent: {
        title: "Manage",
        present: "Ocultar não presente no Manage?"
    },
    chart: {
        title: "Logins e utilizadores por dia",
        chart: "Número de logins por {{scale}}",
        userCount: "Total de logins",
        uniqueUserCount: "Utilizadores únicos",
        loading: "A recolher logins....",
        noResults: "Nenhum logins é registrado para o período especificado e filtros especificados.",
        reset: "Redefinir para padrão.",
        date: "Data",
        logins: "Logins por {{scale}}",
        allLogins: "# Logins",
        uniqueLogins: "Logins únicos",
        sp: "Serviço",
        idp: "Instituição"
    },
    clipboard: {
        copied: "Copiado!",
        copy: "Copiar para a memória"
    },
    live: {
        chartTitle: "Logins por {{scale}} {{institutionType}}",
        aggregatedChartTitlePeriod: "Logins no período de {{period}} por {{group}} {{institutionType}}",
        noTimeFrameChart: "Logins a partir de {{from}} até {{to}} {{institutionType}}",
        institutionType: "para a instiruição tipo '{{institutionType}}'"
    },
    filters: {
        title: "Filtros",
        state: "Estado do Provedor",
        stateValues: {
            all: "Todos",
            prodaccepted: "prodaccepted",
            testaccepted: "testaccepted"
        },
        provider: "Entity type",
        providerValues: {
            sp: "Provedores de Serviços",
            idp: "Provedores de Identidade"
        },
        uniques: "Include unique user count"
    },
    eduGain: {
        loading: "A carregar...",
        title: "Provedores de Identidade",
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
        title: "Erro inesperado",
        body: "Isto é embaraçoso! Ocorreu um erro inesperado. Esta situação foi registada e reportada. Por favor, tente de novo...",
        ok: "Fechar"
    },
    not_found: {
        title: "404",
        description_html: "Não foi possível encontrar a página requisitada"
    },
    server_error: {
        title: "500 Erro inesperado",
    }


};

export default I18n.translations.pt;
