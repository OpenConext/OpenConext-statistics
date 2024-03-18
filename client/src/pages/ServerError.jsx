import React from "react";
import I18n from "../locale/I18n";
import "./NotFound.scss";

export default function ServerError() {
    return (
        <div className="mod-server-error">
            <h1>{I18n.t("server_error.title")}</h1>
            <p>{I18n.t("error_dialog.body")}</p>
        </div>
    );
}