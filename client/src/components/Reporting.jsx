import React from "react";
import I18n from "../locale/I18n";
import "./Reporting.scss";
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
                    <CheckBox info={I18n.t("reporting.newcomers")}
                              name="newcomers"

                              value={modus === "newcomers"}

                              onChange={e => onToggle(e.target.checked)}/>
                    <CheckBox info={I18n.t("reporting.unused")}
                              name="unused"
                              value={modus !== "newcomers"}

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

