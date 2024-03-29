import PropTypes from "prop-types";
import React from "react";
import I18n from "../locale/I18n";
import Select from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import "./Filters.scss";
import CheckBox from "./CheckBox";

const STATES = ["all", "prodaccepted", "testaccepted"];
const PROVIDERS = ["sp", "idp"];

export default class Filters extends React.PureComponent {

    constructor() {
        super();
        this.state = {
            displayDetails: true
        };
    }

    render() {
        const {displayDetails} = this.state;
        const {
            displayProvider, onChangeProvider, provider, onChangeState, state, onChangeUniques, uniques, displayUniques,
            onChangeSp, onChangeIdp, sp, idp, serviceProviders, identityProviders = [], onChangeInstitutionType, institutionType, groupedBySp
        } = this.props;
        const institutionTypes = Array.from(new Set(identityProviders.filter(idp => idp["coin:institution_type"]).map(idp => idp["coin:institution_type"])));
        const serviceProviderOptions = [{value: "", label: I18n.t("providers.all.sp")}]
            .concat((serviceProviders || []).map(p => ({
                value: p.id,
                label: I18n.locale === "en" ? p.name_en : p.name_nl || p.id
            })));
        const serviceProviderOption = serviceProviderOptions.find(o => o.value === sp) || serviceProviderOptions[0];
        const identityProviderOptions = [{value: "", label: I18n.t("providers.all.idp")}]
            .concat((identityProviders || []).map(p => ({
                value: p.id,
                label: I18n.locale === "en" ? p.name_en : p.name_nl || p.id
            })));
        const identityProviderOption = identityProviderOptions.find(o => o.value === idp) || identityProviderOptions[0];
        const institutionOptions = [{value: "", label: I18n.t("providers.all.idp_type")}]
            .concat((institutionTypes || []).map(t => ({
                value: t,
                label: t
            })));
        const institutionOption = institutionOptions.find(o => o.value === institutionType) || institutionOptions[0];
        const stateOptions = STATES.map(s => ({value: s, label: I18n.t(`filters.stateValues.${s}`)}));
        const stateOption = stateOptions.find(o => o.value === state) || stateOptions[1];
        const providerOptions = PROVIDERS.map(s => ({
            value: s,
            label: I18n.t(`filters.providerValues.${s}`)
        }));
        const providerOption = providerOptions.find(o => o.value === provider) || providerOptions[0];
        return (
            <div className="filters">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>{I18n.t("filters.title")}</span>
                {displayDetails && <section className="controls">
                    {onChangeSp && <div>
                        <span className="first sub-title">{I18n.t("providers.sp")}</span>
                        <Select className={`${sp ? "" : "select-all"}`}
                                onChange={option => option ? onChangeSp(option.value) : onChangeSp("")}
                                options={serviceProviderOptions}
                                value={serviceProviderOption}
                                searchable={true}
                                clearable={true}/>
                    </div>}
                    {onChangeIdp && <div>
                        <span className="sub-title">{I18n.t("providers.idp")}</span>
                        <Select className={`${idp ? "" : "select-all"}`}
                                onChange={option => option ? onChangeIdp(option.value) : onChangeIdp("")}
                                options={identityProviderOptions}
                                value={identityProviderOption}
                                searchable={true}
                                clearable={true}/>
                    </div>}
                    {onChangeInstitutionType && <div>
                        <span className="sub-title">{I18n.t("providers.institution_type")}</span>
                        <Select className={`${institutionType ? "" : "select-all"}`}
                                onChange={option => option ? onChangeInstitutionType(option.value) : onChangeInstitutionType("")}
                                options={institutionOptions}
                                value={institutionOption}
                                searchable={true}
                                clearable={true}
                                disabled={groupedBySp === true}/>
                    </div>}
                    {displayProvider && <span className="sub-title">{I18n.t("filters.provider")}</span>}
                    {displayProvider && <Select onChange={option => option ? onChangeProvider(option.value) : null}
                                                options={providerOptions}
                                                value={providerOption}
                                                searchable={false}
                                                clearable={false}
                    />}
                    <span className="sub-title">{I18n.t("filters.state")}</span>
                    <Select onChange={option => option ? onChangeState(option.value) : null}
                            options={stateOptions}
                            value={stateOption}
                            searchable={false}
                            clearable={false}
                    />
                    {displayUniques && <CheckBox name="uniques" value={uniques || false}
                                                 info={I18n.t("filters.uniques")}
                                                 onChange={onChangeUniques}
                    />}
                </section>}
            </div>
        );
    }
}

Filters.propTypes = {
    displayProvider: PropTypes.bool,
    onChangeProvider: PropTypes.func,
    provider: PropTypes.string,
    onChangeState: PropTypes.func.isRequired,
    state: PropTypes.string,
    onChangeUniques: PropTypes.func,
    uniques: PropTypes.bool,
    displayUniques: PropTypes.bool,
    onChangeSp: PropTypes.func,
    onChangeIdp: PropTypes.func,
    onChangeInstitutionType: PropTypes.func,
    serviceProviders: PropTypes.array,
    identityProviders: PropTypes.array,
    sp: PropTypes.string,
    idp: PropTypes.string,
    institutionType: PropTypes.string,
    groupedByIdp: PropTypes.bool,
    groupedBySp: PropTypes.bool
};
