import React from "react";
import PropTypes from "prop-types";
import * as HighChart from "highcharts";
import * as HighStock from 'highcharts/highstock'
import HighChartContainer from "./HighChartContainer";
import I18n from "i18n-js";
import "./Chart.css";

export default class Chart extends React.PureComponent {

    nonAggregatedOptions = (data) => ({
        chart: {zoomType: "x"},
        title: {text: null},
        yAxis: {
            title: {text: "Logins"},
            labels: {},
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },
        xAxis: {
            type: "datetime"
        },
        legend: {verticalAlign: "top"},
        credits: {enabled: false},
        plotOptions: {
            series: {
                showInNavigator: true,
                marker: {
                    enabled: true,
                    radius: data.length < 3 ? 12 : data.length > 31 ? 0 : 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            color: "#15A300",
            name: 'Unique logins',
            data: data.filter(p => p.distinct_count_user_id).map(p => [p.time, p.distinct_count_user_id])
        }, {
            color: "#D4AF37",
            name: 'Total logins',
            data: data.filter(p => p.count_user_id).map(p => [p.time, p.count_user_id])
        }]
    });

    aggregatedOptions = (data, yValues, userCount, uniqueUserCount) => ({
        chart: {
            type: 'bar',
            height: data.length * 25 + 120
        },
        title: {text: null},
        xAxis: {
            categories: yValues, title: {text: null}
        },
        yAxis: {min: 0, title: {text: null}},
        tooltip: {valueSuffix: " logins"},
        plotOptions: {bar: {dataLabels: {enabled: true}}},
        legend: {verticalAlign: "top"},
        credits: {enabled: false},
        series: [
            {name: 'Total logins', color: "#15A300", data: userCount.map(p => p.sum_count_user_id)},
            {name: 'Unique logins', color: "#D4AF37", data: uniqueUserCount.map(p => p.sum_distinct_count_user_id)}
        ]
    });

    renderChart = (data, includeUniques, title, aggregate, groupedByIdp, groupedBySp) => {
        if (data.length === 1 && data[0] === "no_results") {
            return <section className="loading">
                <em>{I18n.t("chart.noResults")}</em>
            </section>;
        }
        const userCount = data.filter(p => aggregate ? p.sum_count_user_id : p.count_user_id);
        const uniqueUserCount = includeUniques ? data.filter(p => aggregate ? p.sum_distinct_count_user_id : p.distinct_count_user_id) : [];
        const groupedByBoth = groupedByIdp && groupedBySp;
        const yValues = aggregate ? Array.from(new Set(userCount.map(p => groupedByBoth ? `${p.sp_entity_id}-${p.idp_entity_id}` :
            groupedBySp ? p.sp_entity_id : groupedByIdp ? p.idp_entity_id : I18n.t("chart.allLogins")))) : [];

        const options = aggregate ? this.aggregatedOptions(data, yValues, userCount, uniqueUserCount) : this.nonAggregatedOptions(data);
        return (
            <section className="chart">
                {title && <span className="title">{title}</span>}
                <HighChartContainer highcharts={aggregate ? HighChart : HighStock}
                                    constructorType={aggregate ? "chart" : "stockChart"}
                                    options={options}/>
            </section>
            //
        );
    };

    render() {
        const {data, includeUniques, title, aggregate, groupedBySp, groupedByIdp} = this.props;
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
