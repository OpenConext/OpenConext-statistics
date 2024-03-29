import I18n from "../locale/I18n";
import en from "../locale/en";
import nl from "../locale/nl";

const start = () => {
    //we need to use them, otherwise the imports are deleted when organizing them
    expect(I18n).toBeDefined();
    expect(en).toBeDefined();
    expect(nl).toBeDefined();
    I18n.locale = "en";

};

test("Test suite must contain at least one test", () => {});

export default start;