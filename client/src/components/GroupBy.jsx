import React from "react";
import PropTypes from "prop-types";
import I18n from "../locale/I18n";
import "./GroupBy.scss";
import {CSVDownload} from "react-csv";
import CheckBox from "./CheckBox";

export default class GroupBy extends React.PureComponent {

    constructor() {
        super();
        this.state = {
            displayDetails: true
        };
    }

    render() {
        const {displayDetails} = this.state;
        const {
            groupedBySp, groupedByIdp, onChangeGroupBySp, onChangeGroupByIdp, download, matrix, onDownload,
            downloading
        } = this.props;
        const className = downloading ? "grey disabled" : "blue";
        return (
            <div className="providers">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>
                    {I18n.t("providers.title")}
                    </span>
                {displayDetails && <section className="controls">
                    <CheckBox info={I18n.t("providers.groupBy", {type: I18n.t("providers.sp")})}
                              name="sp"
                              value={groupedBySp}
                              onChange={onChangeGroupBySp}/>
                    <CheckBox info={I18n.t("providers.groupBy", {type: I18n.t("providers.idp")})}
                              name="sp"
                              value={groupedByIdp}
                              onChange={onChangeGroupByIdp}/>
                    {<a href="/download" className={`download button ${className}`}
                        onClick={onDownload}>{I18n.t("providers.matrix")}</a>}
                    {download &&
                        <CSVDownload target="_parent" data={matrix} filename="sp-idp-matrix.csv"></CSVDownload>}
                </section>}
            </div>
        );
    }
}

GroupBy.propTypes = {
    download: PropTypes.bool.isRequired,
    downloading: PropTypes.bool.isRequired,
    groupedByIdp: PropTypes.bool.isRequired,
    groupedBySp: PropTypes.bool.isRequired,
    onChangeGroupByIdp: PropTypes.func.isRequired,
    onChangeGroupBySp: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    matrix: PropTypes.array,
};
