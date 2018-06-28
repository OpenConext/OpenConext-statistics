import PropTypes from "prop-types";
import React from "react";
import I18n from "i18n-js";
import Select from "react-select";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "react-select/dist/react-select.css";
import "./Period.css";

import "moment/locale/nl";
import moment from "moment";

moment("nl");

const defaultScales = ["year", "quarter", "month", "week", "day", "hour", "minute"];

export default class Period extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {scales: [...defaultScales]}
    }

    invariant = (propCallback, propertyName) => val => {
        const {scale, onChangeScale} = this.props;
        let newScale = scale;
        const daysDiff = Math.abs(this.props[propertyName].diff(val) / 1000 / 3600 / 24);
        let scales = [...defaultScales];
        if (daysDiff > 7) {
            scales = scales.filter(s => s !== "minute");
            if (newScale === "minute") {
                newScale = "hour"
            }
        }
        if (daysDiff > 365) {
            scales = scales.filter(s => s !== "hour");
            if (newScale === "hour") {
                newScale = "day"
            }
        }
        if (scales.length !== defaultScales.length || scales.length > this.state.scales.length) {
            this.setState({scales: scales});
        }
        if (newScale !== scale) {
            onChangeScale(newScale);
        }
        propCallback(val.startOf("day"));
    };


    render() {
        const {scale, onChangeScale, onChangeFrom, from, to, onChangeTo} = this.props;
        const {scales} = this.state;
        return (
            <div className="period">
                <span className="title">{I18n.t("period.title")}</span>
                <section className="controls">
                <span className="sub-title">{I18n.t("period.from")}</span>
                    <DatePicker
                        selected={from}
                        onChange={this.invariant(onChangeFrom, "to")}
                        showYearDropdown
                        locale="nl-nl"
                        showMonthDropdown
                        todayButton={I18n.t("period.today")}
                        maxDate={to}
                    />
                    <span className="sub-title">{I18n.t("period.to")}</span>
                    <DatePicker
                        selected={to}
                        showYearDropdown
                        showMonthDropdown
                        onChange={this.invariant(onChangeTo, "from")}
                        minDate={from}
                        todayButton={I18n.t("period.today")}
                        maxDate={moment()}
                    />
                    <span className="sub-title">{I18n.t("period.scale")}</span>
                    <Select onChange={option => option ? onChangeScale(option.value) : null}
                            options={scales.map(s => ({value: s, label: I18n.t(`period.${s}`)}))}
                            value={scale || "day"}
                            searchable={false}
                            clearable={false}
                    />
                </section>
            </div>
        );
    }
}

Period.propTypes = {
    onChangeScale: PropTypes.func.isRequired,
    scale: PropTypes.string,
    onChangeFrom: PropTypes.func.isRequired,
    from: PropTypes.object,
    onChangeTo: PropTypes.func.isRequired,
    to: PropTypes.object,
};
