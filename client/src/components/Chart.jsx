import React from "react";
import PropTypes from "prop-types";
import Highcharts from "highcharts";
import Highstock from "highcharts/highstock";
import OfflineExporting from "highcharts/modules/offline-exporting";
import HighChartContainer from "./HighChartContainer";

import I18n from "../locale/I18n";
import "./Chart.scss";
import Exporter from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import {mergeList, providerName} from "../utils/Utils";
import {getDateTimeFormat} from "../utils/Time";
import ReactTable from "react-table";
import "react-table/react-table.css";
import ClipBoardCopy from "./ClipBoardCopy";
import {DateTime} from "luxon";
import Spin from "../lib/Spin";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

Exporter(Highcharts);
Exporter(Highstock);
ExportData(Highcharts);
ExportData(Highstock);
OfflineExporting(Highcharts);
OfflineExporting(Highstock);


const navigation = {
    buttonOptions: {
        symbolSize: 18,
        symbolStrokeWidth: 4
    }
};

export default class Chart extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {displayChart: true};
        this.exporting = {
            enabled: true,
            libURL: props.baseUrl,
            allowHTML: true,
            fallbackToExportServer: false,
            buttons: {
                contextButton: {
                    symbolStroke: '#4DB2CF',
                    menuItems: [
                        {
                            text: I18n.t("export.downloadCSV"),
                            onclick: function () {
                                const csv = this.getCSV();
                                const cleanedCsv = csv.replace(/"<span[^>]+(.*?)<\/span>"/g, "\"$1\"").replace(/>/g, "");
                                const jsonString = `data:text/csv;charset=utf-8,${encodeURIComponent(cleanedCsv)}`;
                                const link = document.createElement("a");
                                link.href = jsonString;
                                link.download = "data.csv";
                                link.click();
                            }
                        },
                        'separator',
                        'downloadPNG',
                        'downloadPDF',
                    ]
                },
            },
        };
    }

    labelListener = e => {
        const {onLabelClick} = this.props;
        if (e.target.dataset && e.target.className === "clickable-label") {
            onLabelClick(e.target.id)
        }
    };

    componentDidMount() {
        document.addEventListener("click", this.labelListener);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.labelListener);
    }

    nonAggregatedOptions = (data, includeUniques, guest, scale) => {
        const series = [{
            color: "#D4AF37",
            name: I18n.t("chart.userCount"),
            data: data.filter(p => p.count_user_id !== undefined).map(p => [p.time, p.count_user_id])
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
                type: scale === "minute" ? "line" : "column",
                styledMode: false
            },
            title: {text: this.props.title},
            accessibility: {enabled: false},
            yAxis: {
                title: {text: I18n.t("chart.chart", {scale: I18n.t(`period.${scale}`).toLowerCase()})},
                labels: {},
                min: 0,
                offset: 35,
                allowDecimals: false,
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
                    let dateTime = DateTime.fromMillis(this.x).toUTC();
                    const dtf = getDateTimeFormat(scale, false, true);
                    const format = dateTime.toFormat(dtf, {locale: I18n.locale});
                    res += `<span style="font-size: 11px;margin-left: 3px;display: inline-block">${format}</span>`;
                    return res;
                },
                useHTML: true,
                shared: true,
                backgroundColor: "rgba(255,255,255,1)"
            },
            xAxis: {
                type: "datetime",
                tickPositioner: function () {
                    if (!this.tickPositions.includes(this.min)) {
                        this.tickPositions.push(this.min);
                    }
                    return this.tickPositions;
                },
                labels: {
                    formatter: function () {
                        if (series[0].data.length === 1) {
                            let dateTime = DateTime.fromMillis(this.value);
                            if (scale !== "minute" && scale !== "hour") {
                                dateTime = dateTime.toUTC();
                            }
                            return dateTime.toFormat(getDateTimeFormat(scale, false, true), {locale: I18n.locale});
                        } else {
                            return this.axis.defaultLabelFormatter.call(this)
                        }
                    }
                },
            },
            legend: {verticalAlign: "top"},
            rangeSelector: {
                buttons: [],
                enabled: false
            },
            navigation: navigation,
            exporting: this.exporting,
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
            {name: I18n.t("chart.userCount"), color: "#D4AF37", data: data.map(p => p.count_user_id)}
        ];

        if (includeUniques) {
            series.push({
                name: I18n.t("chart.uniqueUserCount"),
                color: "#15A300",
                data: data.map(p => p.distinct_count_user_id)
            })
        }
        return {
            chart: {
                type: "bar",
                height: Math.max(data.length * 50 + 120, guest ? 575 : 350)
            },
            title: {text: this.props.title},
            accessibility: {enabled: false},
            xAxis: {
                categories: yValues, title: {text: null},
                labels: {
                    useHTML: true
                }
            },
            yAxis: {min: 0, allowDecimals: false, title: {text: null}},
            tooltip: {
                valueSuffix: " logins",
                useHTML: false,
                shared: true,
                backgroundColor: "rgba(255,255,255,1)",
                positioner: function (labelWidth, labelHeight, point) {
                    return {x: this.chart.axisOffset[3] + 15, y: point.plotY};
                }
            },
            plotOptions: {bar: {dataLabels: {enabled: true}}},
            legend: {verticalAlign: "top"},
            navigation: navigation,
            exporting: this.exporting,
            credits: {enabled: false},
            series: series,
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
        const groupedByBoth = groupedBySp & groupedByIdp;
        let name = groupedByBoth ? (providerName(sp, point.sp_entity_id) + " - " + providerName(sp, point.idp_entity_id)) :
            groupedBySp ? providerName(sp, point.sp_entity_id) : providerName(idp, point.idp_entity_id);
        const id = groupedBySp ? point.sp_entity_id : point.idp_entity_id;
        return groupedByBoth ? name : `<span class="clickable-label" id="${id}" data-id="true">${name}</span>`;
    };

    providerAccessor = (groupedBySp, serviceProvidersDict, identityProvidersDict, encodeForDownload = false) => p => {
        const result = groupedBySp ? providerName(serviceProvidersDict[p.sp_entity_id], p.sp_entity_id) :
            providerName(identityProvidersDict[p.idp_entity_id], p.idp_entity_id);
        return encodeForDownload ? `"${result}"` : result;
    };

    numberWithDots = (n, printable) => n ? (printable ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : n) : "";

    dateAccessor = p => {
        return DateTime.fromJSDate(new Date(p.time)).toUTC().toFormat("yyyy-LL-dd", {locale: I18n.locale});
    }

    loginsAccessor = printable => p => this.numberWithDots(p.count_user_id, printable);

    usersAccessor = (includeUniques, printable) => p => includeUniques ? this.numberWithDots(p.distinct_count_user_id, printable) : "";

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
                accessor: this.loginsAccessor(true),
                className: "right",
                sortMethod: this.sortNumberStringWithDots,
            }, {
                id: "users",
                Header: I18n.t("chart.uniqueUserCount"),
                accessor: this.usersAccessor(includeUniques, true),
                className: "right",
                sortMethod: this.sortNumberStringWithDots,
            }];
        const headers = ["name,date,logins,users"];
        const text = headers.concat(data
            .map(row => `${this.providerAccessor(groupedBySp, serviceProvidersDict, identityProvidersDict, true)(row)},${this.dateAccessor(row)},${this.loginsAccessor(false)(row)},${this.usersAccessor(includeUniques, false)(row)}`))
            .join("\n");
        return <section className="table">
            {title && <span className="title copy-container">{title} <ClipBoardCopy txt={text}/></span>}
            <ReactTable className="-striped"
                        data={data}
                        showPagination={false}
                        minRows={0}
                        defaultPageSize={data.length}
                        filterable
                        columns={columns}/>
        </section>
    };

    sortNumberStringWithDots = (a, b) => {
        const aSafe = a ? parseInt(a.replace(/\./g, ""), 10) : 0;
        const bSafe = b ? parseInt(b.replace(/\./g, ""), 10) : 0;
        return aSafe - bSafe;
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
            accessor: this.loginsAccessor(true),
            className: "right",
            sortMethod: this.sortNumberStringWithDots,
        }, {
            id: "users",
            Header: I18n.t("chart.uniqueUserCount"),
            accessor: this.usersAccessor(includeUniques, true),
            className: "right",
            sortMethod: this.sortNumberStringWithDots,
        }];
        const groupedByTime = data
            .reduce((acc, p) => {
                (acc[p["time"]] = acc[p["time"]] || []).push(p);
                return acc;
            }, {});
        const headers = ["date,logins,users"];
        const text = headers.concat(Object.keys(groupedByTime)
            .map(time => ({
                time: parseInt(time, 10),
                count_user_id: (groupedByTime[time].find(r => r.count_user_id) || {count_user_id: 0}).count_user_id,
                distinct_count_user_id: (groupedByTime[time].find(r => r.distinct_count_user_id) || {distinct_count_user_id: 0}).distinct_count_user_id
            }))
            .map(row => `${this.dateAccessor(row)},${this.loginsAccessor(false)(row)},${this.usersAccessor(includeUniques, false)(row)}`))
            .join("\n");

        return <section className="table">
            {title && <span className="title copy-container">{title} <ClipBoardCopy txt={text}/></span>}
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
            serviceProvidersDict) : this.renderTableNonAggregate(data, title, includeUniques);

    renderChart = (data, includeUniques, title, aggregate, groupedByIdp, groupedBySp, identityProvidersDict,
                   serviceProvidersDict, guest, displayChart, scale) => {
        const userCount = data.filter(p => p.count_user_id !== undefined);
        const yValues = aggregate ? userCount.map(p => this.renderYvalue(p, groupedByIdp, groupedBySp,
            identityProvidersDict, serviceProvidersDict)) : [];

        const options = aggregate ? this.aggregatedOptions(data, yValues, includeUniques, guest) :
            this.nonAggregatedOptions(data, includeUniques, guest, scale);
        const rightClassName = this.props.rightDisabled ? "disabled" : "";
        return (
            <section className="chart">
                {title && <span className={`title ${displayChart ? "" : "hide"}`}
                                onClick={() => this.setState({displayChart: !this.state.displayChart})}>{title}</span>}
                {displayChart && <HighChartContainer highcharts={aggregate ? Highcharts : Highstock}
                                                     constructorType={aggregate ? "chart" : "stockChart"}
                                                     options={options}/>}
                {(!aggregate && !this.props.noTimeFrame) && <section className="navigate">
                    <span onClick={this.props.goLeft}><i className="fa fa-arrow-left"></i></span>
                    <span onClick={this.props.goRight}><i className={`fa fa-arrow-right ${rightClassName}`}></i></span>
                </section>}
            </section>
        );
    };

    render() {
        const {displayChart} = this.state;
        const {
            data, includeUniques, title, aggregate, groupedBySp, groupedByIdp, identityProvidersDict,
            serviceProvidersDict, guest, scale, reset
        } = this.props;
        if (data.length === 0) {
            return <section className="loading">
                <em>{I18n.t("chart.loading")}</em>
                <FontAwesomeIcon icon="refresh" className="fa-spin fa-2x fa-fw"/>
            </section>;
        }
        if (data.length === 1 && data[0] === "no_results") {
            return <section className="loading">
                <em>{I18n.t("chart.noResults")}</em><a className="reset" href="reset"
                                                       onClick={reset}>{I18n.t("chart.reset")}</a>
            </section>;
        }
        return <div className="chart-container">
            {this.renderChart(data, includeUniques, title, aggregate, groupedByIdp, groupedBySp, identityProvidersDict,
                serviceProvidersDict, guest, displayChart, scale)}
            {(!guest && scale !== "minute" && scale !== "hour") && this.renderTable(data, title, includeUniques, aggregate, groupedBySp, identityProvidersDict,
                serviceProvidersDict)}
        </div>

    };


}
Chart.propTypes = {
    data: PropTypes.array.isRequired,
    scale: PropTypes.string.isRequired,
    includeUniques: PropTypes.bool,
    baseUrl: PropTypes.string,
    title: PropTypes.string,
    groupedBySp: PropTypes.bool,
    groupedByIdp: PropTypes.bool,
    aggregate: PropTypes.bool,
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired,
    guest: PropTypes.bool,
    goLeft: PropTypes.func,
    goRight: PropTypes.func,
    rightDisabled: PropTypes.bool,
    onLabelClick: PropTypes.func,
    noTimeFrame: PropTypes.bool,
    reset: PropTypes.func,
};
