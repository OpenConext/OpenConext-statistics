// import React from "react";
// import PropTypes from "prop-types";
// import Plot from "react-plotly.js";
// import I18n from "i18n-js";
// import "./Chart.css";
//
// const customFormats = ["month", "quarter"];
//
// export default class Chart extends React.PureComponent {
//
//     xAxis = (data, scale) => {
//         const customFormat = customFormats.indexOf(scale) > -1;
//         // const isYears = scale === "year" || false;
//         // const xaxis = {
//         //     autorange: isYears ? false : true,
//         //     type: customFormat ? "-" : "date",
//         //     rangeslider: {range: [data[0].time, data[data.length - 1].time]},
//         //     title: I18n.t("chart.date"),
//         //     showline: true
//         // };
//         const xaxis = {
//             autorange: true,
//             type: customFormat ? "-" : "date",
//             rangeslider: {range: [data[0].time, data[data.length - 1].time]},
//             title: I18n.t("chart.date"),
//             showline: true
//         };
//         // if (isYears) {
//         //     xaxis.tickvals = data.map(p => `${p.time}`);
//         //     xaxis.ticktext = xaxis.tickvals;
//         // }
//         return xaxis;
//     };
//
//     renderAggregatedPlot = (data, includeUniques, title, groupedByIdp, groupedBySp) => {
//         if (data.length === 1 && data[0] === "no_results") {
//             return <section className="loading">
//                 <em>{I18n.t("chart.noResults")}</em>
//             </section>;
//         }
//
//         const userCount = data.filter(p => p.sum_count_user_id);
//         // const xaxis = this.xAxis(userCount, scale);
//         // const yaxis = {autorange: true, type: "linear", showline: true, title: I18n.t("chart.logins", {scale: scale})};
//
//         // var layout = {
//         //     xaxis: {
//         //         tickvals: ['giraffes', 'orangutans', 'monkeys'],
//         //         ticktext: ['giraffes', '<span style="fill:green">orangutans</span>', 'monkeys'],
//         //         tickfont: {size: 16}
//         //     }
//         // }
//         // const mode = (data.length === 2 && includeUniques) || (data.length === 1 && !includeUniques) ? "markers" : "lines";
//         const yValues = userCount.map(p => groupedBySp ? p.sp_entity_id : groupedByIdp?p.idp_entity_id : I18n.t("chart.allLogins"));
//         console.log(`yValues ${yValues.length}`);
//         const plotData = [{
//             type: "bar",
//             name: I18n.t("chart.userCount"),
//             mode: "markers",
//             x: userCount.map(p => p.sum_count_user_id),
//             y: yValues,
//             orientation: "h"
//         }];
//         if (includeUniques) {
//             const uniqueUserCount = data.filter(p => p.sum_distinct_count_user_id);
//             const uniquePlotData = {
//                 type: "bar",
//                 name: I18n.t("chart.uniqueUserCount"),
//                 mode: "markers",
//                 x: uniqueUserCount.map(p => p.sum_distinct_count_user_id),
//                 y: yValues,
//                 orientation: "h",
//                 textposition: "middle center",
//                 line: {color: "#dbd304"}
//             };
//             plotData.push(uniquePlotData)
//         }
//         //TODO calculate height
//         const style = {
//                         height: "100%", width: "100%", "overflowY": "scroll"
//                     };
//         if (yValues.length > 2) {
//             style.minHeight =  `${yValues.length * 25}px`;
//
//         }
//         return (
//             <section className="chart">
//                 {title && <span className="title">{title}</span>}
//                 <Plot
//                     data={plotData}
//                     layout={{
//                         xaxis: {}, yaxis: {}, showlegend: false,
//                         margin: {
//                             l: 350,
//                             t: 100
//                         }
//                     }}
//                     style={style}/>
//             </section>
//             //
//         );
//     };
//
//     renderNonAggregatedPlot = (data, includeUniques, title, scale) => {
//         if (data.length === 1 && data[0] === "no_results") {
//             return <section className="loading">
//                 <em>{I18n.t("chart.noResults")}</em>
//             </section>;
//         }
//
//         const userCount = data.filter(p => p.count_user_id);
//         const xaxis = this.xAxis(userCount, scale);
//         const yaxis = {autorange: true, type: "linear", showline: true, title: I18n.t("chart.logins", {scale: scale})};
//
//         // var layout = {
//         //     xaxis: {
//         //         tickvals: ['giraffes', 'orangutans', 'monkeys'],
//         //         ticktext: ['giraffes', '<span style="fill:green">orangutans</span>', 'monkeys'],
//         //         tickfont: {size: 16}
//         //     }
//         // }
//         const mode = (data.length === 2 && includeUniques) || (data.length === 1 && !includeUniques) ? "markers" : "lines";
//         const plotData = [{
//             type: "scatter",
//             mode: mode,
//             fill: "tozeroy",
//             name: I18n.t("chart.userCount"),
//             x: userCount.map(p => p.time),
//             y: userCount.map(p => p.count_user_id),
//             line: {color: "#058bcf"}
//         }];
//         if (includeUniques) {
//             const uniqueUserCount = data.filter(p => p.distinct_count_user_id);
//             const uniquePlotData = {
//                 fill: "tozeroy",
//                 type: "scatter",
//                 mode: mode,
//                 name: I18n.t("chart.uniqueUserCount"),
//                 x: uniqueUserCount.map(p => p.time),
//                 y: uniqueUserCount.map(p => p.distinct_count_user_id),
//                 line: {color: "#dbd304"}
//             };
//             plotData.push(uniquePlotData)
//         }
//         return (
//             <section className="chart">
//                 {title && <span className="title">{title}</span>}
//                 <Plot
//                     data={plotData}
//                     layout={{
//                         autosize: true,
//                         xaxis: xaxis,
//                         yaxis: yaxis, legend: {
//                             traceorder: 'normal',
//                             bgcolor: '#ececec',
//                             bordercolor: '#dadada',
//                             borderwidth: 2,
//                             radius: 3
//                         }
//                     }}
//                     useResizeHandler={true}
//                     style={{width: "100%", height: "100%"}}/>
//             </section>
//         );
//     };
//
//     render() {
//         const {data, includeUniques, title, scale, aggregate, groupedBySp, groupedByIdp} = this.props;
//         if (data.length === 0) {
//             return <section className="loading">
//                 <em>{I18n.t("chart.loading")}</em>
//                 <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
//             </section>;
//         }
//         if (aggregate) {
//             return this.renderAggregatedPlot(data, includeUniques, title, groupedByIdp, groupedBySp)
//         } else {
//             return this.renderNonAggregatedPlot(data, includeUniques, title, scale);
//         }
//     };
//
//
// }
// Chart.propTypes = {
//     data: PropTypes.array.isRequired,
//     scale: PropTypes.string.isRequired,
//     includeUniques: PropTypes.bool,
//     title: PropTypes.string,
//     groupedBySp: PropTypes.bool,
//     groupedByIdp: PropTypes.bool,
//     aggregate: PropTypes.bool
// };
