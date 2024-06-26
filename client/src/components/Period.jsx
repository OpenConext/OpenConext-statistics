import PropTypes from "prop-types";
import React from "react";
import I18n from "../locale/I18n";
import Select from "react-select";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./Period.scss";

import {isEmpty} from "../utils/Utils";
import {addDays, allowedAggregatedScales, defaultScales, getDateTimeFormat} from "../utils/Time";
import CheckBox from "./CheckBox";
import {DateTime, Info} from "luxon";

const monthOptions = Info.months("long", {locale: I18n.locale}).map((m, index) => ({label: m, value: index}))

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

    renderYearPicker = (date, isFrom, maxYear, onChange) => {
        const currentYear = date.getFullYear();
        const arr = Array.from(new Array((1 + maxYear) - 2011), (x, i) => (i + 2011).toString(10));
        const options = arr.map(m => ({label: m, value: m}));
        return (
            <Select
                value={options.find(option => parseInt(option.value, 10) === currentYear)}
                options={options}
                className={"select-time-unit"}
                searchable={false}
                clearable={false}
                onChange={opt => {
                    const jsDate = new Date();
                    jsDate.setYear(parseInt(opt.value, 10));
                    const yearDate = DateTime.fromJSDate(jsDate);
                    onChange(isFrom ? yearDate.startOf("year").toJSDate() : yearDate.endOf("year").toJSDate());
                }}/>
        )
    };

    renderDatePicker = (scale, isFrom, date, onChange, maxDate, dateFormat, name, showToday = true, forceDatePicker = false) => {
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
                onWeekSelect={date => {
                    const weekDate = DateTime.fromJSDate(date);
                    onChange(isFrom ? weekDate.startOf("week").toJSDate() : weekDate.endOf("week").toJSDate());
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
            const monthValue = monthOptions.find(option => option.value === date.getMonth()) || monthOptions[0];
            return <div className="group-dates">
                <Select
                    value={monthValue}
                    options={monthOptions}
                    searchable={false}
                    className={"select-time-unit"}
                    clearable={false}
                    onChange={opt => {
                        const jsDate = new Date();
                        jsDate.setMonth(parseInt(opt.value, 10))
                        const monthDate = DateTime.fromJSDate(jsDate);
                        onChange(isFrom ? monthDate.startOf("month").toJSDate() : monthDate.endOf("month").toJSDate());
                    }}/>
                {this.renderYearPicker(date, isFrom, maxDate.getFullYear(), onChange)}
            </div>
        }
        if (quarterPicker) {
            const quarterOptions = Array.from(new Array(4), (x, i) => "Q" + (i + 1).toString(10))
                .map(m => ({label: m, value: m}));
            const quarterValue = DateTime.fromJSDate(date).quarter + "Q";
            const quarterValueOption = quarterOptions.find(option => option.value === quarterValue) || quarterOptions[0]
            return <div className="group-dates">
                <Select
                    value={quarterValueOption}
                    options={quarterOptions}
                    className={"select-time-unit"}
                    searchable={false}
                    clearable={false}
                    onChange={opt => {
                        const jsDate = new Date();
                        const quarter = parseInt(opt.value.substring(1), 10);
                        jsDate.setMonth((quarter * 3) - 2);
                        const quarterDate = DateTime.fromJSDate(jsDate);
                        onChange(isFrom ? quarterDate.startOf("quarter").toJSDate() : quarterDate.endOf("quarter").toJSDate())
                    }}/>
                {this.renderYearPicker(date, isFrom, maxDate.getFullYear(), onChange)}
            </div>
        }
        return this.renderYearPicker(date, isFrom, maxDate.getFullYear(), onChange);
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
        const scaleOptions = scales.map(s => ({value: s, label: I18n.t(`period.${s}`)}));
        const scaleValue = scaleOptions.find(s => s.value === scale) ||
            scaleOptions.find(s => s.value === "day");
        return (
            <div className="period">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>
                    {I18n.t("period.title")}
                    </span>
                {displayDetails && <section className="controls">
                    <span className="sub-title">{I18n.t("period.scale")}</span>
                    <Select onChange={option => onChangeScale(option.value)}
                            options={scaleOptions}
                            className={"select-time-unit"}
                            value={scaleValue}
                            searchable={false}
                            clearable={false}
                            disabled={disabled.indexOf("scale") > -1}
                    />
                    {changeTimeFrame && <CheckBox name="no-timeframe-check" value={noTimeFrame}
                                                  readOnly={disabled.indexOf("noTimeframe") > -1}
                                                  onChange={changeTimeFrame}
                                                  info={I18n.t("period.noTimeFrame")}
                                                  tooltip={I18n.t("period.noTimeFrameTooltip")}/>}
                    <span className="sub-title">{fromTitle}</span>
                    {disabled.indexOf("from") === -1 &&
                        this.renderDatePicker(scale, true, from, this.invariant(onChangeFrom, "from"), to, dateFormat, "datepicker-from", false, forceDatePicker)}
                    {showTo && <span key="1" className="sub-title">{I18n.t("period.to")}</span>}
                    {showTo &&
                        this.renderDatePicker(scale, false, to, this.invariant(onChangeTo, "to"), addDays(1), dateFormat, "datepicker-to", true, forceDatePicker)}
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
