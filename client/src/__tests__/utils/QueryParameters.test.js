import {replaceQueryParameter, getParameterByName} from "../../utils/QueryParameters";

test("Replace query parameters", () => {
    const replaced = replaceQueryParameter("?test=bogus", "test", "value");
    expect(replaced).toBe("test=value");
});

test("Replace query parameters preserve existing", () => {
    const replaced = replaceQueryParameter("?test=bogus&name=x", "test", "value");
    expect(replaced).toBe("test=value&name=x");
});

test("Replace query parameters", () => {
    const replaced = replaceQueryParameter("", "test", "value");
    expect(replaced).toBe("test=value");
});

test("Parameter by name", () => {
   expect(getParameterByName("name", "?name=value")).toBe("value");
});

test("Parameter by name not exists", () => {
   expect(getParameterByName("nope", "?name=value")).toBe(null);
});