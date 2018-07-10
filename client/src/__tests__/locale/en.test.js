import React from "react";
import en from "../../locale/en";
import nl from "../../locale/nl";

import start from "../base";

start();

expect.extend({
    toContainKey(translation, key) {
        const pass = (translation !== undefined && translation[key] !== undefined);
        return {
            message: () => `Expected ${key} to be present in ${JSON.stringify(translation)}`,
            pass: pass
        };
    },
});

test("All translations exists in EN and NL", () => {
    const contains = (translation, translationToVerify) => {
        Object.keys(translation).forEach(key => {
            expect(translationToVerify).toContainKey(key);
            const value = translation[key];
            if (typeof value === "object") {
                contains(value, translationToVerify[key])
            }
        });
    };
    contains(en, nl);
    contains(nl, en);

});