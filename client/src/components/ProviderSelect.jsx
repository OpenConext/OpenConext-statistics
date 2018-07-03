import React from "react";
import Select from "react-select";
import I18n from "i18n-js";
import "react-select/dist/react-select.css";
import "./ProviderSelect.css";
import CheckBox from "./CheckBox";

export default function ProviderSelect({
                                           onChange, i18nKey, providers = [], selectedProvider = "", first = false,
                                           groupedBy = false, onChangeGroupBy, aggregate = false
                                       }) {
    return (
        <section className="select-provider">
            <span className={`${first ? 'first ' : ''}sub-title`}>{I18n.t(`providers.${i18nKey}`)}</span>
            <Select onChange={option => option ? onChange(option.value) : null}
                    options={[{value: "", label: I18n.t(`providers.all.${i18nKey}`)}]
                        .concat(providers.map(p => ({
                            value: p.id,
                            label: I18n.locale === "en" ? p.name_en : p.name_nl || p.id
                        })))}
                    value={selectedProvider}
                    searchable={true}
                    clearable={false}/>
            <CheckBox name={i18nKey} value={groupedBy}
                      info={I18n.t("providers.groupBy", {type: I18n.t(`providers.${i18nKey}`)})}
                      onChange={onChangeGroupBy}
                      readOnly={selectedProvider !== "" || !aggregate}/>
        </section>);
}
