import React from "react";
import I18n from "i18n-js";
import "./Reporting.css";
import CheckBox from "./CheckBox";


export default function Reporting({modus, onToggle}) {

    return (
        <div className="reporting">
            <span className="title">{I18n.t("reporting.title")}</span>
            <section className="controls">
                <CheckBox name="newcomers" value={modus === "newcomers"}
                          info={I18n.t("reporting.newcomers")}
                          onChange={e => onToggle(e.target.checked)}/>
                <CheckBox name="unused" value={modus !== "newcomers"}
                          info={I18n.t("reporting.unused")}
                          onChange={e => onToggle(!e.target.checked)}/>
            </section>
        </div>

    );
}

