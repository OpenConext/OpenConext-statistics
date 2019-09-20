import React from "react";
import I18n from "i18n-js";
import "./Animations.css";
import PropTypes from "prop-types";
import Period from "../components/Period";
import moment from "moment";
import {allowedAggregatedScales} from "../utils/Time";
import "moment/locale/nl";
import Filters from "../components/Filters";
import {firstLoginTime, lastLoginTime, loginTops} from "../api";
import ProviderTable from "../components/ProviderTable";
import {isEmpty, providerName} from "../utils/Utils";
import Reporting from "../components/Reporting";
import ClipBoardCopy from "../components/ClipBoardCopy";

moment.locale(I18n.locale);

export default class Animations extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            colors: {},
            provider: "sp",
            state: "prodaccepted",
            from: moment().startOf("year"),
            to: moment().add(1, "day").startOf("day"),
            scale: "year"

        };
    }

    refresh = () => {
        const {colors} = this.state;
        loginTops().then(res => {
            res.forEach(item => {
                if (!colors[item.name]) {
                    colors[item.name] = "#" + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
                    console.log("added color for " + item.name);
                }
            });
            this.setState({data: res, colors: colors});
        });
    };

    componentDidMount() {
        this.refresh();
        this.interval = setInterval(() => this.refresh(), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    onChangeFrom = val => this.setState({from: val}, () => this.refresh());

    onChangeTo = val => this.setState({to: val}, () => this.refresh());

    onChangeScale = val => this.setState({scale: val}, () => this.refresh());

    onChangeProvider = val => this.setState({provider: val}, () => this.refresh());

    onChangeState = val => this.setState({state: val}, () => this.refresh());

    render() {
        const {data, colors, provider, state, from, to, scale} = this.state;

        return (
            <div className="animations">
                <section className="container">
                    <Period onChangeFrom={this.onChangeFrom}
                            onChangeTo={this.onChangeTo}
                            onChangeScale={this.onChangeScale}
                            from={from}
                            to={to}
                            scale={scale}
                            allowedScales={allowedAggregatedScales.slice(0, 4)}
                            disabled={[]}
                            forceDatePicker={true}/>
                    <Filters displayProvider={true}
                             onChangeProvider={this.onChangeProvider}
                             provider={provider}
                             onChangeState={this.onChangeState}
                             state={state}
                             displayUniques={false}
                    />
                </section>
                <section className="content">
                    {
                        data.map((item, index) => {
                            return (
                                <div key={index} className="row-container" style={{order: 100 - item.value}}>
                                    <p>{item.name}</p>
                                    <div className="row" style={{
                                        width: `${item.value * 10}px`,
                                        backgroundColor: colors[item.name]
                                    }}>
                                        <span className="value" style={{color: colors[item.name]}}>{item.value}</span>
                                    </div>
                                    <span className="value">{item.value}</span>
                                </div>);
                        })
                    }
                </section>
            </div>
        );
    }

}

Animations.propTypes = {
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};