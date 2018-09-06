import React from "react";
import I18n from "i18n-js";
import "./ManagePresent.css";
import CheckBox from "./CheckBox";
import PropTypes from "prop-types";

export default class ManagePresent extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            displayDetails: true
        };
    }

    render() {
        const {displayDetails} = this.state;
        const {value, onToggle} = this.props;
        return (
            <div className="manage-present">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>{I18n.t("managePresent.title")}</span>
                {displayDetails && <section className="controls">
                    <CheckBox name="manage" value={value}
                              info={I18n.t("managePresent.present")}
                              onChange={e => onToggle(e.target.checked)}/>
                </section>}
            </div>

        );

    }
}

ManagePresent.propTypes = {
    value: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};

