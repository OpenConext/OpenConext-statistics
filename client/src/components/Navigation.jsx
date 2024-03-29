import React from "react";
import I18n from "../locale/I18n";
import PropTypes from "prop-types";

import {Spinner} from "spin.js";
import spinner from "../lib/Spin";

import {NavLink} from "react-router-dom";

import "./Navigation.scss";
import {isEmpty} from "../utils/Utils";

export default class Navigation extends React.PureComponent {

    constructor() {
        super();
        this.state = {
            loading: false,
        };
    }

    componentDidMount() {
        spinner.onStart = () => this.setState({loading: true});
        spinner.onStop = () => this.setState({loading: false});
    }

    componentDidUpdate() {
        if (this.state.loading) {
            if (!this.spinner) {
                this.spinner = new Spinner({
                    lines: 25, // The number of lines to draw
                    length: 12, // The length of each line
                    width: 2, // The line thickness
                    radius: 8, // The radius of the inner circle
                    color: "#4DB3CF", // #rgb or #rrggbb or array of colors
                    top: "25%",
                    position: "fixed"
                }).spin(this.spinnerNode);
            }
        } else {
            this.spinner = null;
        }
    }

    renderItem(href, value) {
        return (
            <NavLink activeClassName="active" className="menu-item" to={href}>{I18n.t("navigation." + value)}</NavLink>
        );
    }

    render() {
        const {currentUser} = this.props;
        if (isEmpty(currentUser) || currentUser.guest) {
            return null;
        }
        return (
            <div className="navigation-container">
                <div className="navigation">
                    {this.renderItem("/live", "live")}
                    {!currentUser.guest && this.renderItem("/system", "system")}
                    {currentUser.feature_high_scores && this.renderItem("/animations", "animations")}
                </div>
            </div>
        );
    }
}

Navigation.propTypes = {
    currentUser: PropTypes.object.isRequired
};
