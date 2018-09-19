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
    "year": 5,
    "quarter": 4,
    "month": 12,
    "week": 10,
    "day": 90,
    "hour": 24 * 7,
    "minute": 24 * 60
};

export default class SelectPeriod extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {period: "minute"};
    }

    componentDidMount() {
        window.scrollTo(0, document.body.scrollHeight);
    }


    changeSelectPeriod = val => () => {
        const {onChangeSelectPeriod} = this.props;
        const state = {scale: val, to: moment().add(1, "day"), from: moment().subtract(defaultScaleLiterals[val], val)};
        onChangeSelectPeriod(state);
    };

    render() {
        const {period} = this.state;

        return (
            <div className="select-period">
                <span className="title">
                    {I18n.t("selectPeriod.subtitle")}
                    </span>
                <section className="controls">
                    <Select
                        onChange={option => this.setState({period: option.value}, this.changeSelectPeriod(option.value))}
                        options={defaultScales.filter(s => s !== "week").reverse().map(s => ({
                            value: s,
                            label: I18n.t(`selectPeriod.${s}`)
                        }))}
                        value={period}
                        searchable={false}
                        clearable={false}
                    />
                    <span onClick={this.changeSelectPeriod(this.state.period)}><i className="fa fa-refresh" ></i></span>
                </section>
            </div>
        );
    }
}

SelectPeriod.propTypes = {
    onChangeSelectPeriod: PropTypes.func.isRequired
};
