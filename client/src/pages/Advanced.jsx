import React from "react";
import I18n from "i18n-js";
import {health} from "../api";
import "./Advanced.css";

export default class Advanced extends React.Component {

    componentDidMount() {
        health();
    }

    render() {
        return (
            <div className="advanced">
                {I18n.t("todo")}
            </div>
        );
    }
}
