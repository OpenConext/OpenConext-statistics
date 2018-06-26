import React from "react";
import I18n from "i18n-js";
import {health} from "../api";
import "./ServiceProviders.css";

export default class ServiceProviders extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state({
            sp: undefined
        })
    }

    componentDidMount() {
        health();
    }

    render() {

        return (
            <div className="service-providers">
                {I18n.t("todo")}
            </div>
        );
    }
}
