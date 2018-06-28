import React from "react";
import PropTypes from "prop-types";
import Plot from "react-plotly.js";
import I18n from "i18n-js";
import "./Chart.css";

const customFormats = ["month", "quarter"];

export default class Chart extends React.PureComponent {

    xAxis = (data, scale) => {
        const customFormat = customFormats.indexOf(scale) > -1;
        // const isYears = scale === "year" || false;
        // const xaxis = {
        //     autorange: isYears ? false : true,
        //     type: customFormat ? "-" : "date",
        //     rangeslider: {range: [data[0].time, data[data.length - 1].time]},
        //     title: I18n.t("chart.date"),
        //     showline: true
        // };
        const xaxis = {
            autorange: true,
            type: customFormat ? "-" : "date",
            rangeslider: {range: [data[0].time, data[data.length - 1].time]},
            title: I18n.t("chart.date"),
            showline: true
        };
        // if (isYears) {
        //     xaxis.tickvals = data.map(p => `${p.time}`);
        //     xaxis.ticktext = xaxis.tickvals;
        // }
        return xaxis;
    };

    render() {
        const {data, includeUniques, title, scale} = this.props;
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

        const userCount = data.filter(p => p.count_user_id);
        const xaxis = this.xAxis(userCount, scale);
        const yaxis = {autorange: true, type: "linear", showline: true, title: I18n.t("chart.logins", {scale: scale})};

        // var layout = {
        //     xaxis: {
        //         tickvals: ['giraffes', 'orangutans', 'monkeys'],
        //         ticktext: ['giraffes', '<span style="fill:green">orangutans</span>', 'monkeys'],
        //         tickfont: {size: 16}
        //     }
        // }

        const plotData = [{
            type: "scatter",
            mode: "lines",
            fill: "tozeroy",
            name: I18n.t("chart.userCount"),
            x: userCount.map(p => p.time),
            y: userCount.map(p => p.count_user_id),
            line: {color: "#058bcf"}
        }];
        if (includeUniques) {
            const uniqueUserCount = data.filter(p => p.distinct_count_user_id);
            const uniquePlotData = {
                fill: "tozeroy",
                type: "scatter",
                mode: "lines",
                name: I18n.t("chart.uniqueUserCount"),
                x: uniqueUserCount.map(p => p.time),
                y: uniqueUserCount.map(p => p.distinct_count_user_id),
                line: {color: "#dbd304"}
            };
            plotData.push(uniquePlotData)
        }
        return (
            <section className="chart">
                {title && <span className="title">{title}</span>}
                <Plot
                    data={plotData}
                    layout={{
                        autosize: true, xaxis: xaxis, yaxis: yaxis, legend: {
                            traceorder: 'normal',
                            bgcolor: '#ececec',
                            bordercolor: '#dadada',
                            borderwidth: 2,
                            radius: 3
                        }
                    }}
                    useResizeHandler={true}
                    style={{width: "100%", height: "100%"}}/>
            </section>
        );
    };


}
Chart.propTypes = {
    data: PropTypes.array.isRequired,
    scale: PropTypes.string.isRequired,
    includeUniques: PropTypes.bool,
    title: PropTypes.string,
    groupedBy: PropTypes.array
};
