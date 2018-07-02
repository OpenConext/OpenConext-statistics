import React from "react";
import {loginPeriod, loginTimeFrame} from "../api";
import I18n from "i18n-js";
import "./Live.css";
import Period from "../components/Period";
import moment from "moment";
import Chart from "../components/Chart";
import PropTypes from "prop-types";
import Providers from "../components/Providers";
import {isEmpty} from "../utils/Utils";
import {getPeriod} from "../utils/Time";
import "moment/locale/nl";

moment.locale(I18n.locale);

export default class Live extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            from: moment().utc().subtract(31, "day").startOf("day"),
            to: moment().utc().startOf("day"),
            scale: "day",
            sp: undefined,
            idp: undefined,
            aggregate: false,
            groupedByIdp: false,
            groupedBySp: false
        };
    }

    componentDidMount() {
        const {from, to, scale, idp, sp, aggregate, groupedBySp, groupedByIdp} =
            this.state;
        const {user} = this.props;
        const groupBy = aggregate && (isEmpty(sp) || isEmpty(idp)) ? `${groupedByIdp ? "idp_id" : ""},${groupedBySp ? "sp_id" : ""}` : undefined;
        const period = getPeriod(from, scale);
        if (aggregate) {
            loginPeriod({
                period: period,
                include_unique: !user.guest,
                from: period ? undefined : from.utc().unix(),
                to: period ? undefined : to.utc().unix(),
                idp_id: idp,
                sp_id: sp,
                group_by: groupBy
            }).then(res => {
                if (isEmpty(res)) {
                    this.setState({data: res});
                } else if (groupedBySp || groupedByIdp) {
                    const sorted = res.filter(p => p.sum_count_user_id).sort((a, b) => b.sum_count_user_id - a.sum_count_user_id);
                    const uniqueOnes = res.filter(p => p.sum_distinct_count_user_id).reduce((acc, p) => {
                        const key = (groupedByIdp && groupedBySp) ? `${p.sp_entity_id}${p.idp_entity_id}` : groupedBySp ? p.sp_entity_id : p.idp_entity_id;
                        acc[key] = p.sum_distinct_count_user_id;
                        return acc;
                    }, {});
                    const data = sorted.map(p => {
                        const key = (groupedByIdp && groupedBySp) ? `${p.sp_entity_id}${p.idp_entity_id}` : groupedBySp ? p.sp_entity_id : p.idp_entity_id;
                        p.sum_distinct_count_user_id = uniqueOnes[key] || 0;
                        return p;
                    });
                    this.setState({data: data});
                } else {
                    this.setState({
                        data: [{
                            sum_count_user_id: (res.filter(p => p.sum_count_user_id)[0] || {}).sum_count_user_id || 0,
                            sum_distinct_count_user_id: (res.filter(p => p.sum_distinct_count_user_id)[0] || {}).sum_distinct_count_user_id || 0,
                            time: res[0].time
                        }]
                    })
                }
            });
        } else {
            loginTimeFrame({
                from: from.utc().unix(),
                to: to ? to.utc().unix() : moment().utc().startOf("day").unix(),
                include_unique: !user.guest,
                scale: scale,
                idp_id: idp,
                sp_id: sp,
                group_by: groupBy,
                epoch: "ms"
            }).then(res => this.setState({data: res}));
        }
    }

    onChangeFrom = val => {
        this.setState({data: [], from: val},
            () => this.componentDidMount());
    };

    onChangeTo = val => {
        this.setState({data: [], to: val, scale: this.state.aggregate && val ? "none" : this.state.scale},
            () => this.componentDidMount());
    };

    onChangeSp = val => {
        this.setState({data: [], sp: val, groupedBySp: val === "" ? this.state.groupedBySp : false},
            () => this.componentDidMount());
    };

    onChangeIdP = val => {
        this.setState({data: [], idp: val, groupedByIdp: val === "" ? this.state.groupedByIdp : false},
            () => this.componentDidMount());
    };

    onChangeScale = scale => {
        this.setState({
                data: [],
                scale: scale,
                to: scale !== "none" && this.state.aggregate ? undefined : this.state.to
            },
            () => this.componentDidMount());
    };

    onChangeAggregate = e => {
        const aggregate = e.target.checked;
        this.setState({
                data: [],
                aggregate: aggregate,
                scale: aggregate ? "none" : this.state.scale === "none" ? "day" : this.state.scale,
                groupedBySp: aggregate ? this.state.groupedBySp : false,
                groupedByIdp: aggregate ? this.state.groupedByIdp : false
            },
            () => this.componentDidMount());
    };

    onChangeGroupBySp = e => {
        this.setState({data: [], groupedBySp: e.target.checked},
            () => this.componentDidMount());
    };

    onChangeGroupByIdp = e => {
        this.setState({data: [], groupedByIdp: e.target.checked},
            () => this.componentDidMount());
    };

    title = (from, to, scale, sp, idp, aggregate, groupedByIdp, groupedBySp) => {
        if (from && to && !aggregate) {
            return I18n.t("live.chartTitle", {
                from: from.format('MMMM Do YYYY, h:mm:ss a'),
                to: to.format('MMMM Do YYYY, h:mm:ss a'),
                scale: I18n.t(`period.${scale}`)
            });
        }
        if (from && to && aggregate) {
            return I18n.t("live.aggregatedChartTitle", {
                from: from.format('MMMM Do YYYY, h:mm:ss a'),
                to: to.format('MMMM Do YYYY, h:mm:ss a')
            });
        }
        if (scale && scale !== "none" && from && aggregate) {
            return I18n.t("live.aggregatedChartTitlePeriod", {
                period: getPeriod(from, scale)
            });
        }
    };

    render() {
        const {data, from, to, scale, sp, idp, aggregate, groupedByIdp, groupedBySp} = this.state;
        const {identityProviders, serviceProviders, user} = this.props;
        return (
            <div className="live">
                <section className="container">
                    {!user.guest && <Providers onChangeSp={this.onChangeSp}
                                               onChangeIdp={this.onChangeIdP}
                                               identityProviders={identityProviders}
                                               serviceProviders={serviceProviders}
                                               idp={idp}
                                               sp={sp}
                                               aggregate={aggregate}
                                               onChangeAggregate={this.onChangeAggregate}
                                               groupedByIdp={groupedByIdp}
                                               groupedBySp={groupedBySp}
                                               onChangeGroupByIdp={this.onChangeGroupByIdp}
                                               onChangeGroupBySp={this.onChangeGroupBySp}/>}
                    <Period onChangeFrom={this.onChangeFrom}
                            onChangeTo={this.onChangeTo}
                            onChangeScale={this.onChangeScale}
                            from={from}
                            to={to}
                            scale={scale}
                            aggregate={aggregate}/>
                </section>
                <Chart data={data}
                       scale={scale}
                       includeUniques={!user.guest}
                       title={this.title(from, to, scale, sp, idp, aggregate, groupedByIdp, groupedBySp)}
                       groupedBySp={groupedBySp}
                       groupedByIdp={groupedByIdp}
                       aggregate={aggregate}/>
            </div>
        );
    }
}

Live.propTypes = {
    identityProviders: PropTypes.array.isRequired,
    serviceProviders: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired
};