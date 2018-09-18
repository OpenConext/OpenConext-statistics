import PropTypes from "prop-types";
import React from "react";
import I18n from "i18n-js";
import Select from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import "react-select/dist/react-select.css";
import "./SelectPeriod.css";
import {defaultScales} from "../utils/Time";

export default class SelectPeriod extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {period: "minute"}
    }

    changeSelectPeriod = val => () => {
        const {onChangeSelectPeriod} = this.props;
    };

    render() {
        const {period} = this.state;

        return (
            <div className="select-period">
                <span className="title">
                    {I18n.t("selectPeriod.title")}
                    </span>
                <section className="controls">
                    <span className="sub-title">{I18n.t("selectPeriod.subtitle")}</span>
                    <Select onChange={option => {
                        this.setState({period: option.value}, this.changeSelectPeriod(option.value))

                    }}
                            options={defaultScales.filter(s => s !== "week").reverse().map(s => ({value: s, label: I18n.t(`selectPeriod.${s}`)}))}
                            value={period}
                            searchable={false}
                            clearable={false}
                    />
                </section>
            </div>
        );
    }
}

SelectPeriod.propTypes = {
    onChangeSelectPeriod: PropTypes.func.isRequired
};
