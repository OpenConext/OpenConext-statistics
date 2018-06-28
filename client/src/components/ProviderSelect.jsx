import React from "react";
import Select from "react-select";
import I18n from "i18n-js";
import "react-select/dist/react-select.css";
import "./ProviderSelect.css";
import CheckBox from "./CheckBox";

export default function ProviderSelect({
                                           onChange, i18nKey, providers = [], selectedProvider = "",
                                           groupedBy = false, onChangeGroupBy, first = false
                                       }) {
    return (
        <section className="select-provider">
            <span className={`${first ? 'first ' : ''}sub-title`}>{I18n.t(`providers.${i18nKey}`)}</span>
            <Select onChange={option => option ? onChange(option.value) : null}
                    options={[{value: "", label: I18n.t(`providers.all.${i18nKey}`)}]
                        .concat(providers.map(p => ({value: p.name, label: p.id})))}
                    value={selectedProvider}
                    searchable={true}
                    clearable={false}/>
            {selectedProvider !== "" && <CheckBox name={i18nKey} value={groupedBy}
                                                  info={I18n.t("providers.groupBy")}
                                                  onChange={onChangeGroupBy}/>}
        </section>);
}
