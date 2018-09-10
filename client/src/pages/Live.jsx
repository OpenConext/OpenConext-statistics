import React from "react";
import {loginAggregated, loginTimeFrame} from "../api";
import I18n from "i18n-js";
import "./Live.css";
import Period from "../components/Period";
import moment from "moment";
import Chart from "../components/Chart";
import PropTypes from "prop-types";
import GroupBy from "../components/GroupBy";
import {isEmpty, stop} from "../utils/Utils";
import {getPeriod} from "../utils/Time";
import "moment/locale/nl";
import Filters from "../components/Filters";

moment.locale(I18n.locale);

export default class Live extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            // from: moment().subtract(31, "day").startOf("day"),
            // to: moment().add(1, "day").startOf("day"),
            from: moment().subtract(31, "day").subtract(1,"year").startOf("day"),
            to: moment().add(1, "day").subtract(1,"year").startOf("day"),
            scale: "day",
            sp: undefined,
            idp: undefined,
            groupedByIdp: false,
            groupedBySp: false,
            includeUniques: !this.props.user.guest,
            providerState: "all",
            download: false,
            matrix: [],
        };
    }

    componentDidMount() {
        const {from, to, scale, idp, sp, groupedBySp, groupedByIdp, includeUniques, providerState} =
            this.state;
        const groupBy = (isEmpty(sp) || isEmpty(idp)) ? `${groupedByIdp ? "idp_id" : ""},${groupedBySp ? "sp_id" : ""}` : undefined;
        const period = getPeriod(from, scale);
        if (groupedBySp || groupedByIdp) {
            this.doAggregatedLogin(period, includeUniques, from, to, idp, sp, groupBy, providerState, groupedBySp, groupedByIdp);
        } else {
            loginTimeFrame({
                from: from ? from.unix() : moment().startOf("day").unix(),
                to: to ? to.unix() : moment().endOf("day").unix(),
                include_unique: includeUniques,
                scale: scale,
                idp_id: idp,
                sp_id: sp,
                epoch: "ms",
                state: providerState
            }).then(res => this.setState({data: res}));
        }
    }

    doAggregatedLogin = (period, includeUniques, from, to, idp, sp, groupBy, providerState, groupedBySp, groupedByIdp, download = false) => {
        loginAggregated({
            period: period,
            include_unique: includeUniques,
            from: period ? undefined : from.unix(),
            to: period ? undefined : to ? to.unix() : undefined,
            idp_id: idp,
            sp_id: sp,
            group_by: groupBy,
            state: providerState
        }).then(res => {
            if (isEmpty(res)) {
                if (download) {
                    this.setState({matrix: res, download: true}, () => this.setState({download: false}));
                } else {
                    this.setState({data: res});
                }
            } else if (res.length === 1 && res[0] === "no_results") {
                this.setState({data: res});
            } else if (groupedBySp || groupedByIdp) {
                const sorted = res.filter(p => p.count_user_id).sort((a, b) => b.count_user_id - a.count_user_id);
                const uniqueOnes = res.filter(p => p.distinct_count_user_id).reduce((acc, p) => {
                    const key = (groupedByIdp && groupedBySp) ? `${p.sp_entity_id}${p.idp_entity_id}` : groupedBySp ? p.sp_entity_id : p.idp_entity_id;
                    acc[key] = p.distinct_count_user_id;
                    return acc;
                }, {});
                const data = sorted.map(p => {
                    const key = (groupedByIdp && groupedBySp) ? `${p.sp_entity_id}${p.idp_entity_id}` : groupedBySp ? p.sp_entity_id : p.idp_entity_id;
                    p.distinct_count_user_id = uniqueOnes[key] || 0;
                    return p;
                });
                if (download) {
                    this.setState({matrix: data, download: true}, this.setState({download: false}));
                } else {
                    this.setState({data: data});
                }
            } else {
                this.setState({
                    data: [{
                        count_user_id: (res.filter(p => p.count_user_id)[0] || {}).count_user_id || 0,
                        distinct_count_user_id: (res.filter(p => p.distinct_count_user_id)[0] || {}).distinct_count_user_id || 0,
                        time: res[0].time
                    }]
                })
            }
        });
    };

    onChangeFrom = val => this.setState({data: [], from: val}, () => this.componentDidMount());

    onChangeTo = val => this.setState({data: [], to: val}, () => this.componentDidMount());

    onChangeSp = val => this.setState({data: [], sp: val}, () => this.componentDidMount());

    onChangeState = val => this.setState({data: [], providerState: val}, () => this.componentDidMount());

    onChangeIdP = val => this.setState({data: [], idp: val}, () => this.componentDidMount());

    onChangeScale = scale => {
        let from = this.state.from;
        let to = this.state.to;
        let includeUniques = this.state.includeUniques;
        if (scale === "minute" && from.isBefore(moment().add(-1, "day"))) {
            from = moment().add(-1, "day");
            to = moment();
            includeUniques = false;
        } else if (scale === "hour" && from.isBefore(moment().add(-7, "day"))) {
            from = moment().add(-7, "day");
            to = moment();
            includeUniques = false;
        }
        this.setState({
            data: [],
            scale: scale,
            from: from,
            to: to,
            includeUniques: includeUniques
        }, () => this.componentDidMount());
    };

    onChangeUniques = e => this.setState({data: [], includeUniques: e.target.checked}, () => this.componentDidMount());

    onChangeGroupBySp = e => this.setState({
        data: [], groupedBySp: e.target.checked,
        groupedByIdp: false
    }, () => this.componentDidMount());

    onChangeGroupByIdp = e => this.setState({
        data: [], groupedByIdp: e.target.checked,
        groupedBySp: false
    }, () => this.componentDidMount());

    onDownload = e => {
        stop(e);
        const {from, scale, providerState} =
            this.state;
        const period = getPeriod(from, scale || "year");

        this.doAggregatedLogin(period, true, undefined, undefined, undefined, undefined, "idp_id,sp_id", providerState, true, true, true)
    };

    title = (from, to, aggregate, groupedBySp, groupedByIdp, scale) => {
        const format = scale === "minute" || scale === "hour" ? "L": "L";//'MMMM Do YYYY, h:mm:ss a'
        if (!aggregate) {
            return I18n.t("live.chartTitle", {
                from: from.format(format),
                to: to.format(format),
                scale: I18n.t(`period.${scale}`).toLowerCase()
            });
        }
        if (aggregate) {
            return I18n.t("live.aggregatedChartTitlePeriod", {
                period: getPeriod(from, scale),
                group: I18n.t(`providers.${groupedByIdp ? "idp" : "sp"}`)
            });
        }
    };

    render() {
        const {data, from, to, scale, sp, idp, groupedByIdp, groupedBySp, providerState, includeUniques, download, matrix} = this.state;
        const aggregate = groupedByIdp || groupedBySp;
        const {identityProviders, serviceProviders, user, identityProvidersDict, serviceProvidersDict} = this.props;
        return (
            <div className="live">
                <section className="container">
                    <Period onChangeFrom={this.onChangeFrom}
                            onChangeTo={this.onChangeTo}
                            onChangeScale={this.onChangeScale}
                            from={from}
                            to={to}
                            scale={scale}
                            aggregate={aggregate}/>
                    {!user.guest && <GroupBy groupedByIdp={groupedByIdp}
                                             groupedBySp={groupedBySp}
                                             onChangeGroupByIdp={this.onChangeGroupByIdp}
                                             onChangeGroupBySp={this.onChangeGroupBySp}
                                             download={download}
                                             onDownload={this.onDownload}
                                             matrix={matrix}/>}
                    {!user.guest && <Filters onChangeState={this.onChangeState}
                                             onChangeUniques={this.onChangeUniques}
                                             state={providerState}
                                             uniques={includeUniques}
                                             displayUniques={true}
                                             onChangeSp={this.onChangeSp}
                                             onChangeIdp={this.onChangeIdP}
                                             identityProviders={identityProviders}
                                             serviceProviders={serviceProviders}
                                             idp={idp}
                                             sp={sp}/>}
                </section>
                <Chart data={data}
                       scale={scale}
                       includeUniques={includeUniques}
                       title={this.title(from, to, aggregate, groupedBySp, groupedByIdp, scale)}
                       groupedBySp={groupedBySp}
                       groupedByIdp={groupedByIdp}
                       aggregate={aggregate}
                       identityProvidersDict={identityProvidersDict}
                       serviceProvidersDict={serviceProvidersDict}
                       guest={user.guest}/>
            </div>
        );
    }
}

Live.propTypes = {
    identityProviders: PropTypes.array.isRequired,
    serviceProviders: PropTypes.array.isRequired,
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};