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


    render() {
        const {displayDetails} = this.state;
        const {scale, onChangeScale, onChangeFrom, from, to, onChangeTo, aggregate, allowedScales, disabled = []} = this.props;
        let scales;
        if (isEmpty(allowedScales)) {
            scales = aggregate ? [...this.state.scales].filter(s => allowedAggregatedScales.indexOf(s) > -1) : this.state.scales;
        } else {
            scales = allowedScales;
        }
        const fromTitle = I18n.t(aggregate ? "period.date" : "period.from");
        const dateFormat =  aggregate ? getDateTimeFormat(scale || "day") : "L";
        return (
            <div className="period">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}
                >{I18n.t("period.title")}</span>
                {displayDetails && <section className="controls">
                    <span className="sub-title">{fromTitle}</span>
                    <DatePicker
                        selected={from}
                        onChange={this.invariant(onChangeFrom, "from")}
                        showYearDropdown
                        showMonthDropdown
                        todayButton={I18n.t("period.today")}
                        maxDate={to}
                        minDate={scale === "minute" ? moment().add(-1, "day") : scale === "hour" ? moment().add(-7, "day") : moment(0)}
                        disabled={disabled.indexOf("from") > -1}
                        dateFormat={dateFormat}
                    />
                    <span key="1" className="sub-title">{I18n.t("period.to")}</span>
                    <DatePicker key="2"
                                selected={aggregate ? undefined : to}
                                showYearDropdown
                                showMonthDropdown
                                onChange={this.invariant(onChangeTo, "to")}
                                minDate={moment(from).add(1, "day")}
                                todayButton={I18n.t("period.today")}
                                maxDate={moment().add(1, "day")}
                                disabled={aggregate || disabled.indexOf("to") > -1}
                    />
                    <span className="sub-title">{I18n.t("period.scale")}</span>
                    <Select onChange={option => option ? onChangeScale(option.value) : null}
                            options={scales.map(s => ({value: s, label: I18n.t(`period.${s}`)}))}
                            value={scale || "day"}
                            searchable={false}
                            clearable={false}
                            disabled={disabled.indexOf("scale") > -1}
                    />
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
    disabled: PropTypes.array
};
