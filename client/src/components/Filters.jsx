import PropTypes from "prop-types";
import React from "react";
import I18n from "i18n-js";
import Select from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import "react-select/dist/react-select.css";
import "./Filters.css";
import CheckBox from "./CheckBox";

const STATES = ["all", "prodaccepted", "testaccepted"];

export default class Filters extends React.PureComponent {

    render() {
        const {onChangeState, state, onChangeUniques, uniques} = this.props;
        return (
            <div className="filters">
                <span className="title">{I18n.t("filters.title")}</span>
                <section className="controls">
                    <span className="sub-title">{I18n.t("filters.state")}</span>
                    <Select onChange={option => option ? onChangeState(option.value) : null}
                            options={STATES.map(s => ({value: s, label: I18n.t(`filters.stateValues.${s}`)}))}
                            value={state || "all"}
                            searchable={false}
                            clearable={false}
                    />
                    <CheckBox name="uniques" value={uniques || false}
                              info={I18n.t("filters.uniques")}
                              onChange={onChangeUniques}
                    />
                </section>
            </div>
        );
    }
}

Filters.propTypes = {
    onChangeState: PropTypes.func.isRequired,
    state: PropTypes.string,
    onChangeUniques: PropTypes.func.isRequired,
    uniques: PropTypes.bool
};
