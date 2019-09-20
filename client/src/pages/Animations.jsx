import React from "react";
import I18n from "i18n-js";
import "./Animations.css";
import Period from "../components/Period";
import moment from "moment";
import {allowedAggregatedScales, getPeriod} from "../utils/Time";
import "moment/locale/nl";
import Filters from "../components/Filters";
import {loginTops} from "../api";

moment.locale(I18n.locale);

const name = "name";
const value = "value";

export default class Animations extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            colors: {},
            provider: "sp",
            state: "prodaccepted",
            from: moment().add(-5, "year").startOf("year"),
            to: moment().endOf("day"),
            scale: "year",
            initial: true
        };
    }

    refresh = (initial = true) => {
        const {colors, from, scale} = this.state;
        const newFrom = initial ? from : moment(from).add(1, scale);
        loginTops().then(res => {
            res.forEach(item => {
                if (!colors[item[name]]) {
                    colors[item[name]] = "#" + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6); //"#a8d9e6";
                }
            });
            this.setState({data: res, colors: colors, from: newFrom});
        });
    };

    componentDidMount() {
        this.refresh(true);
        this.interval = setInterval(() => this.refresh(false), 7500);
    }

    componentWillUnmount = () => clearInterval(this.interval);

    changeAttr = name => val => this.setState({[name]: val}, this.refresh);

    render() {
        const {data, colors, provider, state, from, to, scale} = this.state;
        return (
            <div className="animations">
                <section className="container">
                    <Period onChangeFrom={this.changeAttr("from")}
                            onChangeTo={() => true}
                            onChangeScale={this.changeAttr("scale")}
                            to={to}
                            from={from}
                            scale={scale}
                            aggregate={true}
                            allowedScales={allowedAggregatedScales.slice(0, 4)}
                            disabled={[]}/>
                    <Filters displayProvider={true}
                             onChangeProvider={this.changeAttr("provider")}
                             provider={provider}
                             onChangeState={this.changeAttr("state")}
                             state={state}
                             displayUniques={false}
                    />
                </section>
                <section className="content">
                    {data.length > 0 &&
                    <p className="title">{I18n.t("live.aggregatedChartTitlePeriod", {
                        period: getPeriod(from, scale),
                        group: I18n.t(`providers.${provider}`),
                        institutionType: ""
                    })}</p>}
                    {
                        data.map((item, index) =>
                            <div key={index} className="row" style={{
                                order: 100 - item[value],
                                width: `${item[value] * 10 + 200}px`,
                                backgroundColor: colors[item[name]]
                            }}>
                                <p style={{color: colors[item[name]]}}>{item[name]}</p>
                                <span className="value">{item[value]}</span>
                            </div>
                        )
                    }
                    {data.length === 0 && <p>{I18n.t("chart.noResults")}</p>}
                </section>
            </div>
        );
    }

}
