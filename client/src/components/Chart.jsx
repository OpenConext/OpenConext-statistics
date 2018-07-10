import React from "react";
import PropTypes from "prop-types";
import * as HighChart from "highcharts";
import * as HighStock from "highcharts/highstock";
import HighChartContainer from "./HighChartContainer";
import I18n from "i18n-js";
import "./Chart.css";
import moment from "moment";
import "moment/locale/nl";

import Exporter from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';

Exporter(HighChart);
Exporter(HighStock);
ExportData(HighChart);
ExportData(HighStock);


moment.locale(I18n.locale);

export default class Chart extends React.PureComponent {

    navigation = () => (
        {
            buttonOptions: {
                symbolSize: 18,
                symbolStrokeWidth: 4
            }
        }
    );

    exporting = () => ({
        enabled: true,
        buttons: {
            contextButton: {
                symbolStroke: '#4DB2CF',
                menuItems: [
                    'downloadCSV',
                    'separator',
                    'downloadPNG',
                    'downloadPDF',
                ]
            }
        }
    });

    nonAggregatedOptions = (data) => ({
        chart: {
            zoomType: "x",
            height: true ? 525 : 625
        },
        title: {text: null},
        yAxis: {
            title: {text: "Logins"},
            labels: {},
            plotLines: [{
                value: 0,
                width: 2,
                color: "silver"
            }]
        },
        xAxis: {
            type: "datetime"
        },
        legend: {verticalAlign: "top"},
        rangeSelector: {
            buttons: []
        },
        navigation: this.navigation(),
        exporting: this.exporting(),
        credits: {enabled: false},
        plotOptions: {
            series: {
                showInNavigator: true,
                marker: {
                    enabled: true,
                    radius: data.length < 3 ? 12 : data.length > 31 ? 0 : 5
                },
                lineWidth: 3,
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
            name: I18n.t("chart.uniqueUserCount"),
            data: data.filter(p => p.distinct_count_user_id).map(p => [p.time, p.distinct_count_user_id])
        }, {
            color: "#D4AF37",
            name: I18n.t("chart.userCount"),
            data: data.filter(p => p.count_user_id).map(p => [p.time, p.count_user_id])
        }]
    });

    aggregatedOptions = (data, yValues) => ({
        chart: {
            type: "bar",
            height: Math.max(data.length * 50 + 120, 375)
        },
        title: {text: null},
        xAxis: {
            categories: yValues, title: {text: null}
        },
        yAxis: {min: 0, title: {text: null}},
        tooltip: {valueSuffix: " logins"},
        plotOptions: {bar: {dataLabels: {enabled: true}}},
        legend: {verticalAlign: "top"},
        navigation: this.navigation(),
        exporting: this.exporting(),
        credits: {enabled: false},
        series: [
            {name: I18n.t("chart.userCount"), color: "#15A300", data: data.map(p => p.count_user_id)},
            {name: I18n.t("chart.uniqueUserCount"), color: "#D4AF37", data: data.map(p => p.distinct_count_user_id)}
        ]
    });

    renderChart = (data, includeUniques, title, aggregate, groupedByIdp, groupedBySp) => {
        if (data.length === 1 && data[0] === "no_results") {
            return <section className="loading">
                <em>{I18n.t("chart.noResults")}</em>
            </section>;
        }
        const userCount = data.filter(p => p.count_user_id);
        const groupedByBoth = groupedByIdp && groupedBySp;
        const yValues = aggregate ? userCount.map(p => groupedByBoth ? `${p.sp_entity_id}-${p.idp_entity_id}` :
            groupedBySp ? p.sp_entity_id : groupedByIdp ? p.idp_entity_id : I18n.t("chart.allLogins")) : [];

        const options = aggregate ? this.aggregatedOptions(data, yValues) : this.nonAggregatedOptions(data);
        return (
            <section className="chart">
                {title && <span className="title">{title}</span>}
                <HighChartContainer highcharts={aggregate ? HighChart : HighStock}
                                    constructorType={aggregate ? "chart" : "stockChart"}
                                    options={options}/>
            </section>
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
