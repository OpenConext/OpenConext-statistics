import React from "react";
import PropTypes from "prop-types";
import Highcharts from "highcharts";
import HighChartContainer from "./HighChartContainer";
import I18n from "i18n-js";
import "./Chart.css";

const customFormats = ["month", "quarter"];

export default class Chart extends React.PureComponent {

    renderChart = (data, includeUniques, title, aggregate, groupedByIdp, groupedBySp) => {
        if (data.length === 1 && data[0] === "no_results") {
            return <section className="loading">
                <em>{I18n.t("chart.noResults")}</em>
            </section>;
        }

        const userCount = data.filter(p => p.sum_count_user_id);
        const uniqueUserCount = data.filter(p => p.sum_distinct_count_user_id);

        const options = {
            title: {
                text: null
            },
            series: [{
                data: [1, 2, 3]
            }]
        };
        return (
            <section className="chart">
                {title && <span className="title">{title}</span>}
                <HighChartContainer highcharts={Highcharts} options={options}/>
            </section>
            //
        );
    };


    render() {
        const {data, includeUniques, title, scale, aggregate, groupedBySp, groupedByIdp} = this.props;
        if (data.length === 0) {
            return <section className="loading">
                <em>{I18n.t("chart.loading")}</em>
                <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
            </section>;
        }
        return this.renderChart(data, includeUniques, title, aggregate, groupedByIdp, groupedBySp);
    };


}
Chart.propTypes = {
    data: PropTypes.array.isRequired,
    scale: PropTypes.string.isRequired,
    includeUniques: PropTypes.bool,
    title: PropTypes.string,
    groupedBySp: PropTypes.bool,
    groupedByIdp: PropTypes.bool,
    aggregate: PropTypes.bool
};
