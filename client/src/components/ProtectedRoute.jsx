import React from "react";
import {Redirect, Route} from "react-router-dom";
import PropTypes from "prop-types";

export default function ProtectedRoute({path, user, render}) {
    if (!user) {
        return <Redirect to={"/"}/>;
    }
    return <Route path={path} render={render}/>;
}

ProtectedRoute.propTypes = {
    path: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired
};
