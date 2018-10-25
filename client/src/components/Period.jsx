import PropTypes from "prop-types";
import React from "react";
import I18n from "i18n-js";
import Select from "react-select";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "react-select/dist/react-select.css";
import "./Period.css";
import moment from "moment";
import {isEmpty} from "../utils/Utils";
import {allowedAggregatedScales, defaultScales, getDateTimeFormat} from "../utils/Time";
import CheckBox from "./CheckBox";

export default class Period extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {scales: [...defaultScales], displayDetails: true}
    }

    invariant = (propCallback, propertyName) => val => {
        if (isEmpty(val)) {
            propCallback(val);
            return;
        }
        if (!isEmpty(this.props.allowedScales || isEmpty(this.props[propertyName]))) {
            propCallback(val.startOf("day"));
            return;
        }
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

    renderYearPicker = (date, maxYear, onChange) => {
        const currentYear = date.format("YYYY");
        const arr = Array.from(new Array((1 + maxYear) - 2011), (x, i) => (i + 2011).toString(10));
        const options = arr.map(m => ({label: m, value: m}));
        return <Select
            value={currentYear}
            options={options}
            searchable={false}
            clearable={false}
            onChange={opt => onChange(moment(date).year(parseInt(opt.value, 10)))}/>
    };

    renderDatePicker = (scale, date, onChange, maxDate, dateFormat, name, showToday = true, forceDatePicker = false) => {
        const dayPicker = ["all", "minute", "hour", "day", "week"].includes(scale);
        const monthPicker = scale === "month";
        const quarterPicker = scale === "quarter";
        if (dayPicker || forceDatePicker) {
            return <DatePicker
                ref={name}
                selected={date}
                preventOpenOnFocus
                onChange={onChange}
                showYearDropdown
                showMonthDropdown
                showWeekNumbers
                onWeekSelect={m => {
                    onChange(moment(date).week(m.week()));
                    const datepicker = this.refs[name];
                    datepicker.setOpen(false);
                }}
                weekLabel="Week"
                todayButton={showToday ? I18n.t("period.today") : undefined}
                maxDate={maxDate}
                disabled={false}
                dateFormat={dateFormat}
            />
        }
        if (monthPicker) {
            return <div className="group-dates">
                <Select
                    value={date.format("MMMM")}
                    options={moment.months().map(m => ({label: m, value: m}))}
                    searchable={false}
                    clearable={false}
                    onChange={opt => onChange(moment(date).month(opt.value))}/>
                {this.renderYearPicker(date, maxDate.year(), onChange)}
            </div>
        }
        if (quarterPicker) {
            return <div className="group-dates">
                <Select
                    value={date.format("[Q]Q")}
                    options={Array.from(new Array(4), (x, i) => "Q" + (i + 1).toString(10))
                        .map(m => ({label: m, value: m}))}
                    searchable={false}
                    clearable={false}
                    onChange={opt => onChange(moment(date).quarter(parseInt(opt.value.substring(1), 10)))}/>
                {this.renderYearPicker(date, maxDate.year(), onChange)}
            </div>
        }
        return this.renderYearPicker(date, maxDate.year(), onChange);
    };


    render() {
        const {displayDetails} = this.state;
        const {
            scale, onChangeScale, onChangeFrom, from, to, onChangeTo, aggregate, allowedScales, disabled = [],
            noTimeFrame, changeTimeFrame, forceDatePicker
        } = this.props;
        let scales;
        if (isEmpty(allowedScales)) {
            scales = aggregate ? [...this.state.scales].filter(s => allowedAggregatedScales.indexOf(s) > -1) : this.state.scales;
        } else {
            scales = allowedScales;
        }
        const fromTitle = I18n.t(aggregate ? "period.date" : "period.from");
        const dateFormat = getDateTimeFormat(scale, forceDatePicker);

        const showTo = (!aggregate && disabled.indexOf("to") === -1);
        return (
            <div className="period">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>
                    {I18n.t("period.title")}
                    </span>
                {displayDetails && <section className="controls">
                    <span className="sub-title">{I18n.t("period.scale")}</span>
                    <Select onChange={option => onChangeScale(option.value)}
                            options={scales.map(s => ({value: s, label: I18n.t(`period.${s}`)}))}
                            value={scale || "day"}
                            searchable={false}
                            clearable={false}
                            disabled={disabled.indexOf("scale") > -1}
                    />
                    {changeTimeFrame && <CheckBox name="no-timeframe-check" value={noTimeFrame}
                                                  readOnly={disabled.indexOf("noTimeframe") > -1}
                                                  onChange={changeTimeFrame} info={I18n.t("period.noTimeFrame")}
                                                  tooltip={I18n.t("period.noTimeFrameTooltip")}/>}
                    <span className="sub-title">{fromTitle}</span>
                    {disabled.indexOf("from") === -1 &&
                    this.renderDatePicker(scale, from, this.invariant(onChangeFrom, "from"), to, dateFormat, "datepicker-from", false, forceDatePicker)}
                    {showTo && <span key="1" className="sub-title">{I18n.t("period.to")}</span>}
                    {showTo &&
                    this.renderDatePicker(scale, to, this.invariant(onChangeTo, "to"), moment().add(1, "day"), dateFormat, "datepicker-to", true, forceDatePicker)}
                </section>}
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
    aggregate: PropTypes.bool,
    allowedScales: PropTypes.array,
    disabled: PropTypes.array,
    changeTimeFrame: PropTypes.func,
    forceDatePicker: PropTypes.bool
};
