import React from "react";
import {health} from "../api";
import I18n from "i18n-js";

export default class ConnectedIdentityProviders extends React.PureComponent {

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