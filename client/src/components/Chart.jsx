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
import {providerName} from "../utils/Utils";

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

    nonAggregatedOptions = (data, includeUniques, guest) => {
        const series = [{
            color: "#D4AF37",
            name: I18n.t("chart.userCount"),
            data: data.filter(p => p.count_user_id).map(p => [p.time, p.count_user_id])
        }];
        if (includeUniques) {
            series.push({
                color: "#15A300",
                name: I18n.t("chart.uniqueUserCount"),
                data: data.filter(p => p.distinct_count_user_id).map(p => [p.time, p.distinct_count_user_id])
            });
        }
        return {
            chart: {
                zoomType: "x",
                height: guest ? 525 : 682,
                type: 'column'
            },
            title: {text: null},
            yAxis: {
                title: {text: "Logins"},
                labels: {},
                min: 0,
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
                    column: {
                        pointPadding: 0,
                        borderWidth: 0,
                        groupPadding: 0,
                    },
                    dataGrouping: {
                        enabled: data.length > 74880
                    },
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
            series: series
        }
    };

    aggregatedOptions = (data, yValues, includeUniques, guest) => {
        const series = [
            {name: I18n.t("chart.userCount"), color: "#15A300", data: data.map(p => p.count_user_id)}
        ];
        if (includeUniques) {
            series.push({
                name: I18n.t("chart.uniqueUserCount"),
                color: "#D4AF37",
                data: data.map(p => p.distinct_count_user_id)
            })
        }
        return {
            chart: {
                type: "bar",
                height: Math.max(data.length * 50 + 120, guest ? 575 : 350)
            },
            title: {text: null},
            xAxis: {
                categories: yValues, title: {text: null},
                labels: {
                    useHTML: true
                }
            },
            yAxis: {min: 0, title: {text: null}},
            tooltip: {valueSuffix: " logins"},
            plotOptions: {bar: {dataLabels: {enabled: true}}},
            legend: {verticalAlign: "top"},
            navigation: this.navigation(),
            exporting: this.exporting(),
            credits: {enabled: false},
            series: series
        };
    };

    renderYvalue = (point, groupedByIdp, groupedBySp, identityProvidersDict, serviceProvidersDict) => {
        if (!groupedBySp && !groupedByIdp) {
            return I18n.t("chart.allLogins");
        }
        let sp, idp;
        if (groupedBySp) {
            sp = serviceProvidersDict[point.sp_entity_id];
        }
        if (groupedByIdp) {
            idp = identityProvidersDict[point.idp_entity_id];
        }
        return groupedBySp ? providerName(sp, point.sp_entity_id) : providerName(idp, point.idp_entity_id);
    };

    renderChart = (data, includeUniques, title, aggregate, groupedByIdp, groupedBySp, identityProvidersDict, serviceProvidersDict, guest) => {
        if (data.length === 1 && data[0] === "no_results") {
            return <section className="loading">
                <em>{I18n.t("chart.noResults")}</em>
            </section>;
        }
        const userCount = data.filter(p => p.count_user_id);
        const yValues = aggregate ? userCount.map(p => this.renderYvalue(p, groupedByIdp, groupedBySp,
            identityProvidersDict, serviceProvidersDict)) : [];

        const options = aggregate ? this.aggregatedOptions(data, yValues, includeUniques, guest) :
            this.nonAggregatedOptions(data, includeUniques, guest);

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
        const {data, includeUniques, title, aggregate, groupedBySp, groupedByIdp, identityProvidersDict, serviceProvidersDict, guest} = this.props;
        if (data.length === 0) {
            return <section className="loading">
                <em>{I18n.t("chart.loading")}</em>
                <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
            </section>;
        }
        return this.renderChart(data, includeUniques, title, aggregate, groupedByIdp, groupedBySp, identityProvidersDict,
            serviceProvidersDict, guest);
    };


}
Chart.propTypes = {
    data: PropTypes.array.isRequired,
    scale: PropTypes.string.isRequired,
    includeUniques: PropTypes.bool,
    title: PropTypes.string,
    groupedBySp: PropTypes.bool,
    groupedByIdp: PropTypes.bool,
    aggregate: PropTypes.bool,
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired,
    guest: PropTypes.bool
};
