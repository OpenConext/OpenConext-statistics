import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import "./ErrorDialog.scss";
import I18n from "../locale/I18n";
import {stop} from "../utils/Utils";

export default function ErrorDialog({isOpen = false, close}) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={close}
            contentLabel={I18n.t("error_dialog.title")}
            className="confirmation-dialog-content"
            overlayClassName="confirmation-dialog-overlay"
            closeTimeoutMS={250}>
            <section className="dialog-header error">
                {I18n.t("error_dialog.title")}
            </section>
            <section className="dialog-content">
                <h2>{I18n.t("error_dialog.body")}</h2>
            </section>
            <section className="dialog-buttons">
                <a className="button blue error" onClick={e => {
                    stop(e);
                    close(e);
                }}>{I18n.t("error_dialog.ok")}</a>
            </section>
        </Modal>
    );

}

ErrorDialog.propTypes = {
    isOpen: PropTypes.bool,
    close: PropTypes.func.isRequired
};


