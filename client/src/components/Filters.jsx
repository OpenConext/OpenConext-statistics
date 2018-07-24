import PropTypes from "prop-types";
import React from "react";
import I18n from "i18n-js";
import Select from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import "react-select/dist/react-select.css";
import "./Filters.css";
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
        const {displayProvider, onChangeProvider, provider, onChangeState, state, onChangeUniques, uniques, displayUniques} = this.props;
        return (
            <div className="filters">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>{I18n.t("filters.title")}</span>
                {displayDetails && <section className="controls">
                    {displayProvider && <span className="sub-title">{I18n.t("filters.provider")}</span>}
                    {displayProvider && <Select onChange={option => option ? onChangeProvider(option.value) : null}
                                                options={PROVIDERS.map(s => ({
                                                    value: s,
                                                    label: I18n.t(`filters.providerValues.${s}`)
                                                }))}
                                                value={provider || PROVIDERS[0]}
                                                searchable={false}
                                                clearable={false}
                    />}
                    <span className="sub-title">{I18n.t("filters.state")}</span>
                    <Select onChange={option => option ? onChangeState(option.value) : null}
                            options={STATES.map(s => ({value: s, label: I18n.t(`filters.stateValues.${s}`)}))}
                            value={state || "all"}
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
    displayUniques: PropTypes.bool
};
