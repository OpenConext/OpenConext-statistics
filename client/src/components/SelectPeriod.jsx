import PropTypes from "prop-types";
import React from "react";
import I18n from "../locale/I18n";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "react-datepicker/dist/react-datepicker.css";
import "./SelectPeriod.scss";

import {addDays, defaultScales} from "../utils/Time";
import {DateTime} from "luxon";

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
            to: addDays(1),
            from: DateTime.now().minus({[val]: defaultScaleLiterals[val]}).toJSDate(),
            period: val
        };
        onChangeSelectPeriod(state);
    };

    render() {
        const {period} = this.props;

        const options = defaultScales.reverse().map(s => ({value: s, label: I18n.t(`selectPeriod.${s}`)}));
        const option = options.find(o => o.value === period) || defaultScales[0];
        return (
            <div className="select-period">
                <span className="title">
                    {I18n.t("selectPeriod.subtitle")}
                    </span>
                <section className="controls">
                    <Select
                        className={"Select"}
                        onChange={option => this.setState({period: option.value}, this.changeSelectPeriod(option.value))}
                        options={options}
                        value={option}
                        searchable={false}
                        clearable={false}
                    />
                    <span onClick={this.changeSelectPeriod(this.props.period)}><FontAwesomeIcon icon="refresh" className="refresh"/></span>
                </section>
            </div>
        );
    }
}

SelectPeriod.propTypes = {
    onChangeSelectPeriod: PropTypes.func.isRequired,
    period: PropTypes.string.isRequired
};
