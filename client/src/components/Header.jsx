import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import logoSurfConext from "../images/logo@2x.png";
import logoOpenConext from "../images/open-conext-logo.png";
import "./Header.css";
import {isEmpty, stop} from "../utils/Utils";
import LanguageSelector from "./LanguageSelector";

export default class Header extends React.PureComponent {

    constructor() {
        super();
        this.state = {
            dropDownActive: false
        };
    }

    renderProfileLink(currentUser) {
        return (
            <p className="welcome-link">
                <i className="fa fa-user-circle-o"></i>
                {currentUser.display_name}
            </p>
        );
    }

    login = e => {
        stop(e);
        window.location.href = "/login";
    };

    render() {
        let currentUser = this.props.currentUser;
        if (isEmpty(currentUser)) {
            currentUser = {product: {}}
        }
        const logo = currentUser.product === "OpenConext" ? logoOpenConext : logoSurfConext;
        return (
            <div className="header-container">
                <div className="header">
                    <Link to="/" className="logo"><img src={logo} alt=""/></Link>
                    <p className="title">{I18n.t(`header.${currentUser.product.organization || "OpenConext"}`)}</p>
                    <ul className="links">
                        {currentUser.guest && <li className="item">
                            <a href="#login" onClick={this.login}>{I18n.t("header.links.login")}</a>
                        </li>}
                        <li>
                            <LanguageSelector/>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

}

Header.propTypes = {
    currentUser: PropTypes.object.isRequired
};
