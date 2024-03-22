export function replaceQueryParameter(windowLocationSearch, name, value) {
    const searchParams = new URLSearchParams(windowLocationSearch);
    searchParams.set(name, value);
    return searchParams.toString();
}

export function getParameterByName(name, windowLocationSearch) {
    const searchParams = new URLSearchParams(windowLocationSearch);
    return searchParams.get(name);
}