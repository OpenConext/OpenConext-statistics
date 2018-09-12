import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {unmountComponentAtNode} from "react-dom";
import {Link} from "react-router-dom";
import logoSurfConext from "../images/logo@2x.png";
import logoOpenConext from "../images/open-conext-logo.png";
import {logOut} from "../api";
import "./Header.css";
import {isEmpty} from "../utils/Utils";
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

    stop = e => {
        e.preventDefault();
        //
        // const node = document.getElementById("app");
        // unmountComponentAtNode(node);
        // logOut();
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
                        <li className="item profile"
                            tabIndex="1" onBlur={() => this.setState({dropDownActive: false})}>
                            {this.renderProfileLink(currentUser)}
                        </li>
                        <li className="item border-left">
                            <a onClick={this.stop}>{I18n.t("header.links.logout")}</a>
                        </li>
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
