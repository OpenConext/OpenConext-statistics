import React from "react";
import PropTypes from "prop-types";
import * as HighChart from "highcharts";
import * as HighStock from "highcharts/highstock";
import HighChartContainer from "./HighChartContainer";
import I18n from "i18n-js";
import "./Chart.css";
import moment from "moment";
import Exporter from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import {isEmpty, mergeList, providerName} from "../utils/Utils";
import {getDateTimeFormat} from "../utils/Time";
import "moment/locale/nl";
import ReactTable from "react-table";
import ClipBoardCopy from "./ClipBoardCopy";

Exporter(HighChart);
Exporter(HighStock);
ExportData(HighChart);
ExportData(HighStock);

moment.locale(I18n.locale);
const navigation = {
    buttonOptions: {
        symbolSize: 18,
        symbolStrokeWidth: 4
    }
};

const exporting = {
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
};

export default class Chart extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {displayChart: true}
    }

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
            tooltip: {
                formatter: function () {
                    let res = this.points.reduce((acc, point) => {
                        acc += `
<div style="display: flex;align-items: center; margin-bottom: 5px">
    <span style="color:${point.color};font-size:16px;margin-right: 5px;display: inline-block">\u25CF</span>
    <span style="margin-right: 5px">${point.series.name}:</span>
    <span style="margin-left:auto;display: inline-block; font-weight:bold">${(point.y).toLocaleString()}</span>
</div>`;
                        return acc
                    }, "");
                    res += `<span style="font-size: 10px">${moment.unix(this.x / 1000).utc().format("LLL")}</span>`;
                    return res;
                },
                useHTML: true,
                shared: true
            },
            xAxis: {
                type: "datetime",
            },
            legend: {verticalAlign: "top"},
            rangeSelector: {
                buttons: []
            },
            navigation: navigation,
            exporting: exporting,
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
                    threshold: null,
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
                    useHTML: false
                }
            },
            yAxis: {min: 0, title: {text: null}},
            tooltip: {valueSuffix: " logins"},
            plotOptions: {bar: {dataLabels: {enabled: true}}},
            legend: {verticalAlign: "top"},
            navigation: navigation,
            exporting: exporting,
            credits: {enabled: false},
            series: series
        };
    };

    renderYvalue = (point, groupedByIdp, groupedBySp, identityProvidersDict, serviceProvidersDict, groupByScale) => {
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
        const groupedByBoth = groupedBySp & groupedByIdp;
        let name = groupedByBoth ? (providerName(sp, point.sp_entity_id) + " - " + providerName(sp, point.idp_entity_id)) :
            groupedBySp ? providerName(sp, point.sp_entity_id) : providerName(idp, point.idp_entity_id);
        if (groupByScale) {
            const time = moment(moment.utc(point["time"]).toDate());
            name += " - ";
            name += time.format(getDateTimeFormat(groupByScale))
        }
        return name;
    };

    providerAccessor = (groupedBySp, serviceProvidersDict, identityProvidersDict) =>
        p => groupedBySp ? providerName(serviceProvidersDict[p.sp_entity_id], p.sp_entity_id) :
            providerName(identityProvidersDict[p.idp_entity_id], p.idp_entity_id);

    dateAccessor = p => moment(p.time).utc().format("YYYY-MM-DD");

    loginsAccessor = p => p.count_user_id ? (p.count_user_id).toLocaleString() : "";

    usersAccessor = includeUniques => p => p.distinct_count_user_id && includeUniques ? (p.distinct_count_user_id).toLocaleString() : "";

    renderTableAggregate = (data, title, includeUniques, groupedBySp, identityProvidersDict,
                            serviceProvidersDict) => {
        const columns = [
            {
                id: "provider",
                Header: I18n.t(`chart.${groupedBySp ? "sp" : "idp"}`),
                minWidth: 600,
                accessor: this.providerAccessor(groupedBySp, serviceProvidersDict, identityProvidersDict)
            }, {
                id: "date",
                Header: I18n.t("chart.date"),
                accessor: this.dateAccessor
            }, {
                id: "logins",
                Header: I18n.t("chart.userCount"),
                accessor: this.loginsAccessor,
                className: "right"
            }, {
                id: "users",
                Header: I18n.t("chart.uniqueUserCount"),
                accessor: this.usersAccessor(includeUniques),
                className: "right"
            }];
        const text = data
            .map(row => `${this.providerAccessor(groupedBySp, serviceProvidersDict, identityProvidersDict)(row)}\t${this.dateAccessor(row)}\t${this.loginsAccessor(row)}\t${this.usersAccessor(includeUniques)(row)}`)
            .join("\n");
        return <section className="table">
            {title && <span className="title">{title} <ClipBoardCopy identifier="table-export" text={text}/></span>}
            <ReactTable className="-striped"
                        data={data}
                        showPagination={false}
                        minRows={0}
                        defaultPageSize={data.length}
                        filterable
                        columns={columns}/>
        </section>
    };


    renderTableNonAggregate = (data, title, includeUniques) => {
        const tableData = includeUniques ? mergeList(data, "time") : data;
        const columns = [{
            id: "date",
            Header: I18n.t("chart.date"),
            accessor: this.dateAccessor
        }, {
            id: "logins",
            Header: I18n.t("chart.userCount"),
            accessor: this.loginsAccessor,
            className: "right"
        }, {
            id: "users",
            Header: I18n.t("chart.uniqueUserCount"),
            accessor: this.usersAccessor(includeUniques),
            className: "right"
        }];
        const text = data
            .map(row => `${this.dateAccessor(row)}\t${this.loginsAccessor(row)}\t${this.usersAccessor(includeUniques)(row)}`)
            .join("\n");

        return <section className="table">
            {title && <span className="title">{title} <ClipBoardCopy identifier="table-export" text={text}/></span>}
            <ReactTable className="-striped"
                        data={tableData}
                        showPagination={false}
                        minRows={0}
                        defaultPageSize={data.length}
                        filterable
                        columns={columns}/>
        </section>
    };

    renderTable = (data, title, includeUniques, aggregate, groupedBySp, identityProvidersDict,
                   serviceProvidersDict) =>
        aggregate ? this.renderTableAggregate(data, title, includeUniques, groupedBySp, identityProvidersDict,
            serviceProvidersDict) : this.renderTableNonAggregate(data, title, includeUniques)

    renderChart = (data, includeUniques, title, aggregate, groupedByIdp, groupedBySp, identityProvidersDict,
                   serviceProvidersDict, guest, groupByScale, displayChart) => {
        const userCount = data.filter(p => p.count_user_id);
        const yValues = aggregate ? userCount.map(p => this.renderYvalue(p, groupedByIdp, groupedBySp,
            identityProvidersDict, serviceProvidersDict, groupByScale)) : [];

        const options = aggregate ? this.aggregatedOptions(data, yValues, includeUniques, guest, !isEmpty(groupByScale)) :
            this.nonAggregatedOptions(data, includeUniques, guest);

        return (
            <section className={`chart ${displayChart ? "" : "hide"}`}
                     onClick={() => this.setState({displayChart: !this.state.displayChart})}>
                {title && <span className="title">{title}</span>}
                {displayChart && <HighChartContainer highcharts={aggregate ? HighChart : HighStock}
                                                     constructorType={aggregate ? "chart" : "stockChart"}
                                                     options={options}/>}
            </section>
        );
    };

    render() {
        const {displayChart} = this.state;
        const {
            data, includeUniques, title, aggregate, groupedBySp, groupedByIdp, identityProvidersDict,
            serviceProvidersDict, guest, groupByScale
        } = this.props;
        if (data.length === 0) {
            return <section className="loading">
                <em>{I18n.t("chart.loading")}</em>
                <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
            </section>;
        }
        if (data.length === 1 && data[0] === "no_results") {
            return <section className="loading">
                <em>{I18n.t("chart.noResults")}</em>
            </section>;
        }
        return <div className="chart-container">
            {this.renderChart(data, includeUniques, title, aggregate, groupedByIdp, groupedBySp, identityProvidersDict,
                serviceProvidersDict, guest, groupByScale, displayChart)}
            {this.renderTable(data, title, includeUniques, aggregate, groupedBySp, identityProvidersDict,
                serviceProvidersDict)}
        </div>

    };


}
Chart.propTypes = {
    data: PropTypes.array.isRequired,
    scale: PropTypes.string.isRequired,
    groupByScale: PropTypes.string.isRequired,
    includeUniques: PropTypes.bool,
    title: PropTypes.string,
    groupedBySp: PropTypes.bool,
    groupedByIdp: PropTypes.bool,
    aggregate: PropTypes.bool,
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired,
    guest: PropTypes.bool
};
