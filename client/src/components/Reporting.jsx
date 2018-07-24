import React from "react";
import I18n from "i18n-js";
import "./Reporting.css";
import CheckBox from "./CheckBox";
import PropTypes from "prop-types";

export default class Reporting extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            displayDetails: true
        };
    }

    render() {
        const {displayDetails} = this.state;
        const {modus, onToggle} = this.props;
        return (
            <div className="reporting">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>{I18n.t("reporting.title")}</span>
                {displayDetails && <section className="controls">
                    <CheckBox name="newcomers" value={modus === "newcomers"}
                              info={I18n.t("reporting.newcomers")}
                              onChange={e => onToggle(e.target.checked)}/>
                    <CheckBox name="unused" value={modus !== "newcomers"}
                              info={I18n.t("reporting.unused")}
                              onChange={e => onToggle(!e.target.checked)}/>
                </section>}
            </div>

        );

    }
}

Reporting.propTypes = {
    modus: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired
};

