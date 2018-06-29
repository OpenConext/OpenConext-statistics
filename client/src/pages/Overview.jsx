import React from "react";
import PropTypes from "prop-types";
import "./Overview.css";

export default class Overview extends React.PureComponent {

    render() {
        return (
            <div className="overview">
                {"Not needed anymore"}
            </div>
        );
    }
}

Overview.propTypes = {
    identityProviders: PropTypes.array.isRequired,
    serviceProviders: PropTypes.array.isRequired
};

