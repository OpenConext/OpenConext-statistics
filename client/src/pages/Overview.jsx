import React from "react";
import PropTypes from "prop-types";
import "./Overview.css";
import I18n from "i18n-js";
import {health} from "../api";

export default class Overview extends React.PureComponent {

    componentDidMount() {
        health();
    }

    render() {
        return (
            <div className="overview">
                                {I18n.t("todo")}
            </div>
        );
    }
}

Overview.propTypes = {
    identityProviders: PropTypes.array.isRequired,
    serviceProviders: PropTypes.array.isRequired
};

