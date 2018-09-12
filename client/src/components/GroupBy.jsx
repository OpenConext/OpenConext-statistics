import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import "./GroupBy.css";
import Select from "react-select";
import CheckBox from "./CheckBox";
import {CSVDownload} from "react-csv";
import {getGroupByPeriod} from "../utils/Time";
import ReactTooltip from "react-tooltip";

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
            groupByScale, onChangeGroupByScale, groupByScaleEnabled, timeFrame
        } = this.props;
        return (
            <div className="providers">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>
                    {I18n.t("providers.title")}
                    </span>
                {displayDetails && <section className="controls">
                    <CheckBox name="sp" value={groupedBySp}
                              info={I18n.t("providers.groupBy", {type: I18n.t("providers.sp")})}
                              onChange={onChangeGroupBySp}/>

                    <CheckBox name="idp" value={groupedByIdp}
                              info={I18n.t("providers.groupBy", {type: I18n.t("providers.idp")})}
                              onChange={onChangeGroupByIdp}/>
                    <span data-tip data-for="group-by-scale" className="sub-title">{I18n.t("providers.scale.title")}
                        <i className="fa fa-info-circle"></i>
                    </span>
                    <ReactTooltip id="group-by-scale" type="info" effect="solid">
                        <p dangerouslySetInnerHTML={{__html: I18n.t("providers.scale.html")}}/>
                    </ReactTooltip>
                    <Select className={`${groupByScale ? "" : "select-all"}`}
                            onChange={option => option ? onChangeGroupByScale(option.value) : onChangeGroupByScale("")}
                            options={[{value: "", label: I18n.t("providers.scale.none")}]
                                .concat(
                                    getGroupByPeriod(timeFrame).map(s => ({value: s, label: I18n.t(`period.${s}`)})))}
                            value={groupByScale || ""}
                            searchable={false}
                            clearable={true}
                            disabled={!groupByScaleEnabled}
                    />
                    {<a href="/download" className="download button blue"
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
    groupedByIdp: PropTypes.bool.isRequired,
    groupedBySp: PropTypes.bool.isRequired,
    onChangeGroupByIdp: PropTypes.func.isRequired,
    onChangeGroupBySp: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    matrix: PropTypes.array,
    groupByScale: PropTypes.string,
    onChangeGroupByScale: PropTypes.func,
    groupByScaleEnabled: PropTypes.bool,
    timeFrame: PropTypes.string
};
