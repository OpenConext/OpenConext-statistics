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
import {allowedAggregatedScales, defaultScales} from "../utils/Time";

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
            propCallback(val.utc().startOf("day"));
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
        propCallback(val.utc().startOf("day"));
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
        const fromTitle = I18n.t(isEmpty(allowedScales) ? "period.date" : "period.from");
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
                        utcOffset={moment().utcOffset() / 60}
                        todayButton={I18n.t("period.today")}
                        maxDate={to}
                        disabled={disabled.indexOf("from") > -1}
                    />
                    <span key="1" className="sub-title">{I18n.t("period.to")}</span>
                    <DatePicker key="2"
                                selected={aggregate ? undefined : to}
                                showYearDropdown
                                showMonthDropdown
                                onChange={this.invariant(onChangeTo, "to")}
                                minDate={from}
                                todayButton={I18n.t("period.today")}
                                maxDate={moment().utc().add(1, "day")}
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
