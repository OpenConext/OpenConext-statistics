import React from "react";
import I18n from "i18n-js";
import {health} from "../api";
import "./Advanced.css";

export default class IdentityProviders extends React.PureComponent {

    componentDidMount() {
        health();
    }

    render() {

        return (
            <div className="identity-providers">
                {I18n.t("todo")}
            </div>
        );
    }
}
