import PropTypes from "prop-types";
import React from "react";
import I18n from "i18n-js";
import Select from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import "react-select/dist/react-select.css";
import "./SelectPeriod.css";
import moment from "moment";
import {defaultScales} from "../utils/Time";

const defaultScaleLiterals = {
    "minute": 24 * 60,
    "hour": 24 * 7,
    "day": 90,
    "week": 52,
    "month": 12,
    "quarter": 4,
    "year": 5,
};

export default class SelectPeriod extends React.PureComponent {

    componentDidMount() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    changeSelectPeriod = val => () => {
        const {onChangeSelectPeriod} = this.props;
        const state = {
            scale: val,
            to: moment().add(1, "day"),
            from: moment().subtract(defaultScaleLiterals[val], val),
            period: val
        };
        onChangeSelectPeriod(state);
    };

    render() {
        const {period} = this.props;

        return (
            <div className="select-period">
                <span className="title">
                    {I18n.t("selectPeriod.subtitle")}
                    </span>
                <section className="controls">
                    <Select
                        onChange={option => this.setState({period: option.value}, this.changeSelectPeriod(option.value))}
                        options={defaultScales.map(s => ({value: s, label: I18n.t(`selectPeriod.${s}`)}))}
                        value={period}
                        searchable={false}
                        clearable={false}
                    />
                    <span onClick={this.changeSelectPeriod(this.props.period)}><i className="fa fa-refresh"></i></span>
                </section>
            </div>
        );
    }
}

SelectPeriod.propTypes = {
    onChangeSelectPeriod: PropTypes.func.isRequired,
    period: PropTypes.string.isRequired
};
