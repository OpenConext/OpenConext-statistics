import React from "react";
import I18n from "../locale/I18n";
import "./Advanced.scss";
import PropTypes from "prop-types";
import Period from "../components/Period";

import {allowedAggregatedScales, unixFromDate, unixFromDateTime} from "../utils/Time";
import Filters from "../components/Filters";
import {firstLoginTime, lastLoginTime} from "../api";
import ProviderTable from "../components/ProviderTable";
import {isEmpty, providerName} from "../utils/Utils";
import Reporting from "../components/Reporting";
import ClipBoardCopy from "../components/ClipBoardCopy";
import {DateTime} from "luxon";

export default class Advanced extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filteredData: [],
            from: DateTime.now().startOf("quarter").toJSDate(),
            to: DateTime.now().plus({'day': 1}).startOf("day").toJSDate(),
            scale: "none",
            provider: "sp",
            state: "prodaccepted",
            loaded: false,
            modus: "newcomers"
        };
    }

    componentDidMount() {
        const {from, to, provider, state, modus} = this.state;
        this.setState({"loaded": false});
        const promise = modus === "newcomers" ?
            firstLoginTime({
                from: unixFromDate(from),
                to: unixFromDate(to),
                provider: provider
            }) :
            lastLoginTime({
                from: unixFromDate(from),
                provider: provider

            });
        promise.then(data => {
            const {serviceProvidersDict, identityProvidersDict} = this.props;
            const {provider} = this.state;
            const isSp = provider === "sp";
            const property = isSp ? "sp_entity_id" : "idp_entity_id";
            const dict = isSp ? serviceProvidersDict : identityProvidersDict;
            data.forEach(p => {
                const lookedUp = dict[p[property]];
                p.name = providerName(lookedUp, p[property]);
                if (lookedUp) {
                    p.manage_id = lookedUp.manage_id;
                    p.state = lookedUp.state;
                    p.present_in_manage = true;
                } else {
                    p.present_in_manage = false;
                }
            });
            data = data.filter(p => p.present_in_manage);
            this.setState({
                data: data,
                filteredData: state !== "all" ? data.filter(entity => entity.state === state) : data,
                loaded: true
            });
        });
    }

    toggleModus = val => this.setState({
        modus: val ? "newcomers" : "unused",
        from: DateTime.now().startOf("quarter").toJSDate(),
        to: DateTime.now().plus({"day":1}).startOf("day").toJSDate(),
        scale: "none",
        loaded: false,
        date: [],
        filteredData: [],
    }, () => this.componentDidMount());

    onChangeFrom = val => this.setState({from: val, scale: "none"}, () => this.componentDidMount());

    onChangeTo = val => this.setState({to: val, scale: "none"}, () => this.componentDidMount());

    onChangeProvider = val => this.setState({provider: val}, () => this.componentDidMount());

    onChangeState = val => {
        const data = [...this.state.data];
        const filteredData = val !== "all" ? data.filter(p => p.state === val) : data;
        this.setState({state: val, filteredData: filteredData});
    };

    onChangeScale = scale => {
        if (scale !== "none") {
            const to = DateTime.now();
            const from = to.startOf(scale).toJSDate();
            this.setState({scale: scale, to: to.toJSDate(), from: from}, () => this.componentDidMount());
        } else {
            this.setState({scale: scale}, () => this.componentDidMount());
        }
    };

    render() {
        const {filteredData, from, to, scale, state, provider, loaded, modus} = this.state;
        const {user} = this.props;
        const title = I18n.t(`advanced.${modus}.title`, {
            from: DateTime.fromJSDate(from).toFormat('yyyy-LL-dd'),
            to: DateTime.fromJSDate(to).toFormat('yyyy-LL-dd'),
            provider: I18n.t(`providers.${provider}`)
        });
        const text = filteredData
            .map(p => `${p.time ? DateTime.fromJSDate(new Date(p.time)).toFormat("yyyy-LL-dd") : I18n.t("providerTable.noTime")},${isEmpty(p.name) ? p.manage_id : p.name}`)
            .join("\n");

        return (
            <div className="advanced">
                <section className="container">
                    <Period onChangeFrom={this.onChangeFrom}
                            onChangeTo={this.onChangeTo}
                            onChangeScale={this.onChangeScale}
                            from={from}
                            to={to}
                            scale={scale || "none"}
                            allowedScales={allowedAggregatedScales.concat(["none"])}
                            disabled={modus === "newcomers" ? [] : ["to"]}
                            forceDatePicker={true}/>
                    <Reporting modus={modus} onToggle={this.toggleModus}/>
                    <Filters displayProvider={true}
                             onChangeProvider={this.onChangeProvider}
                             provider={provider}
                             onChangeState={this.onChangeState}
                             state={state}
                             displayUniques={false}
                    />
                </section>
                {!loaded && <section className="loading">
                    <em>{I18n.t("eduGain.loading")}</em>
                    <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                </section>}
                {(isEmpty(filteredData) && loaded) && <span>{I18n.t(`providerTable.${modus}NoResults`)}</span>}
                {(!isEmpty(filteredData) && loaded) &&
                <section className="content">
                    <span className="title copy-container">{title}<ClipBoardCopy identifier="table-export" text={text}/></span>
                    <ProviderTable data={filteredData}
                                   modus={modus}
                                   user={user}
                                   provider={provider}/>

                </section>}
            </div>
        );
    }

}

Advanced.propTypes = {
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};