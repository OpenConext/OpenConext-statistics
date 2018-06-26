import React from "react";
import I18n from "i18n-js";
import {Link} from "react-router-dom";
import {health} from "../api";

import "./Index.css";

export default class Index extends React.Component {

    componentDidMount() {
        health();
    }

    render() {
        return (
            <div className="mod-index">
                <h1>{I18n.t("index.public")}</h1>
                <ul>
                    <li><a
                        href="https://wiki.surfnet.nl/display/surfconextdev/Availability+SURFconext">{I18n.t("index.availability")}</a>
                    </li>
                    <li><Link to={"/live"}>{I18n.t("index.live")}</Link></li>
                    <li><Link to={"/identity-providers"}>{I18n.t("index.connectedIdentityProviders")}</Link>
                    </li>
                </ul>
                <h1>{I18n.t("index.surfOnly")}</h1>
                <ul>
                    <li><Link to={"/dashboard/overview"}>{I18n.t("index.dashboard")}</Link></li>
                </ul>
            </div>
        );
    }
}

