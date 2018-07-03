import spinner from "../lib/Spin";
import {isEmpty} from "../utils/Utils";

function validateResponse(showErrorDialog) {
    return res => {
        spinner.stop();

        if (!res.ok) {
            if (res.type === "opaqueredirect") {
                setTimeout(() => window.location.reload(true), 100);
                return res;
            }
            const error = new Error(res.statusText);
            error.response = res;

            if (showErrorDialog) {
                setTimeout(() => {
                    throw error;
                }, 250);
            }
            throw error;
        }
        const sessionAlive = res.headers.get("x-session-alive");

        if (sessionAlive !== "true") {
            window.location.reload(true);
        }
        return res;

    };
}

function validFetch(path, options, headers = {}, showErrorDialog = true) {
    const contentHeaders = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...headers
    };

    const fetchOptions = Object.assign({}, {headers: contentHeaders}, options, {
        credentials: "same-origin",
        redirect: "manual"
    });
    spinner.start();
    return fetch(path, fetchOptions)
        .catch(err => {
            spinner.stop();
            throw err;
        })
        .then(validateResponse(showErrorDialog));
}

function fetchJson(path, options = {}, headers = {}, showErrorDialog = true) {
    return validFetch(path, options, headers, showErrorDialog)
        .then(res => res.json());
}

function postPutJson(path, body, method) {
    return fetchJson(path, {method: method, body: JSON.stringify(body)});
}

function fetchDelete(path) {
    return validFetch(path, {method: "delete"});
}

function queryParam(options) {
    const entries = Object.entries(options[0]);
    return entries.reduce((acc, entry) => isEmpty(entry[1]) ? acc : acc + `${entry[0]}=${entry[1]}&`, "?");
}

//API
export function identityProviders() {
    return fetchJson("/api/stats/identity_providers");
}

export function serviceProviders() {
    return fetchJson("/api/stats/service_providers");
}

export function connectedIdentityProviders() {
    return fetchJson("/api/stats//connected_identity_providers");
}

export function lastLogin() {
    return fetchJson("/api/stats/last_login");
}

export function loginTimeFrame({
                                   from, to = Math.floor(new Date().getTime() / 1000), scale = "day",
                                   include_unique = true,
                                   idp_id, sp_id, group_by,
                                   epoch = "ms"
                               }) {
    const query = queryParam(arguments);
    return fetchJson(`/api/stats/login_time_frame${query}`)
}

export function loginPeriod({
                                period = new Date().getFullYear(), include_unique = true,
                                from = undefined, to = undefined,
                                idp_id, sp_id, group_by
                            }) {
    const query = queryParam(arguments);
    return fetchJson(`/api/stats/login_period${query}`)
}

export function health() {
    return fetchJson("/health");
}

export function me() {
    return fetchJson("/api/users/me", {}, {}, false);
}

export function reportError(error) {
    return postPutJson("/api/users/error", error, "post");
}

export function logOut() {
    return fetchDelete("/api/users/logout");
}

