import I18n from "i18n-js";

export function stop(e) {
    if (e !== undefined && e !== null) {
        e.preventDefault();
        e.stopPropagation();
    }
}

export function isEmpty(obj) {
    if (obj === undefined || obj === null) {
        return true;
    }
    if (Array.isArray(obj)) {
        return obj.length === 0;
    }
    if (typeof obj === "string") {
        return obj.trim().length === 0;
    }
    if (typeof obj === "object") {
        return Object.keys(obj).length === 0;
    }
    return false;
}

export function copyToClip(elementId) {
    const listener = e => {
        const str = document.getElementById(elementId).innerHTML.replace(/&amp;/g, "&");
        e.clipboardData.setData("text/plain", str);
        e.preventDefault();
    };
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
}

export function providerName(provider, fallback) {
    if (!provider) {
        return fallback;
    }
    const alt = I18n.locale === "en" ? "nl" : "en";
    return provider[`name_${I18n.locale}`] || provider[`name_${alt}`] || fallback;
}

