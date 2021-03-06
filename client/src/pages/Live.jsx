import React from "react";
import {loginAggregated, loginTimeFrame, uniqueLoginCount} from "../api";
import I18n from "i18n-js";
import "./Live.css";
import Period from "../components/Period";
import moment from "moment";
import Chart from "../components/Chart";
import PropTypes from "prop-types";
import GroupBy from "../components/GroupBy";
import {isEmpty, stop} from "../utils/Utils";
import {addDayDuplicates, getPeriod} from "../utils/Time";
import "moment/locale/nl";
import Filters from "../components/Filters";
import SelectPeriod from "../components/SelectPeriod";

moment.locale(I18n.locale);

const minDiffByScale = {minute: 1, hour: 7, day: 90, week: 365, month: 365, quarter: 365, year: 365 * 5};
const maxDayDiffMainMeasurements = 14;

export default class Live extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.initialStateValues();
    }

    initialStateValues() {
        return {
            data: [],
            from: moment().subtract(24, "hour"),
            to: moment().add(1, "day").startOf("day"),
            scale: "minute",
            sp: undefined,
            idp: undefined,
            institutionType: undefined,
            groupedByIdp: false,
            groupedBySp: false,
            includeUniques: !this.props.user.guest,
            providerState: "prodaccepted",
            download: false,
            downloading: false,
            matrix: [],
            maximumTo: false,
            noTimeFrame: false,
            period: "minute"
        };
    }

    reset = e => {
        stop(e);
        this.setState(this.initialStateValues(), this.refreshStats);
    };

    initialStateNoGroupBy = () => ({
        from: moment().subtract(24, "hour"),
        to: moment().add(1, "day").startOf("day"),
        scale: "minute"
    });

    initialStateGroupBy = () => ({
        from: moment().subtract(1, "day"),
        to: moment(),
        scale: "year"
    });

    componentDidMount() {
        this.setState({data: []}, this.refreshStats);
    }

    refreshStats() {
        const {
            from, to, scale, idp, sp, groupedBySp, groupedByIdp, includeUniques, providerState, noTimeFrame,
            institutionType
        } = this.state;
        let groupBy = undefined;
        if (isEmpty(sp) || isEmpty(idp)) {
            groupBy = `${groupedByIdp ? "idp_id" : ""},${groupedBySp ? "sp_id" : ""}`
        }
        const period = getPeriod(from, scale);
        if (noTimeFrame) {
            uniqueLoginCount({
                from: from ? from.unix() : moment().startOf("day").unix(),
                to: to ? to.unix() : moment().endOf("day").unix(),
                idp_id: idp,
                sp_id: sp,
                epoch: "ms",
                state: providerState
            }).then(res => this.setState({data: res}));
        }
        else if (groupedBySp || groupedByIdp) {
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
                state: providerState,
                institution_type: institutionType
            }).then(res => {
                const hasResults = res.length > 0 && res[0] !== "no_results";
                if (hasResults && (scale === "minute" || scale === "hour")) {
                    const now = moment().unix() * 1000;
                    res = res.filter(p => p.time <= now);
                    res = res.slice(1, res.length - 1);
                }
                if (hasResults && scale === "day") {
                    res = addDayDuplicates(res);
                }
                this.setState({data: res});
            });
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
                    this.setState({matrix: res, download: true}, () => this.setState({
                        download: false,
                        downloading: false
                    }));
                } else {
                    this.setState({data: res});
                }
            } else if (res.length === 1 && res[0] === "no_results") {
                this.setState({data: res});
            } else if (groupedBySp || groupedByIdp) {
                const sorted = res.filter(p => p.count_user_id !== undefined).sort((a, b) => b.count_user_id - a.count_user_id);
                const uniqueOnes = res.filter(p => p.distinct_count_user_id !== undefined).reduce((acc, p) => {
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
                    this.setState({
                        matrix: data,
                        download: true,
                        downloading: false
                    }, () => this.setState({download: false}));
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

    goLeft = e => {
        stop(e);
        let from, to;
        const currentScale = this.state.scale;
        if (currentScale === "minute") {
            from = moment(this.state.from).subtract(12, "hour");
            to = moment(this.state.to).subtract(12, "hour");
        } else if (currentScale === "hour") {
            from = moment(this.state.from).subtract(1, "day");
            to = moment(this.state.to).subtract(1, "day");
        } else {
            from = moment(this.state.from).subtract(1, currentScale);
            to = moment(this.state.to).subtract(1, currentScale);
        }
        this.setState({from: from, to: to, maximumTo: false}, this.componentDidMount)
    };

    goRight = e => {
        stop(e);
        if (this.state.maximumTo) {
            return;
        }
        let from, to;
        const currentScale = this.state.scale;
        if (currentScale === "minute") {
            from = moment(this.state.from).add(12, "hour");
            to = moment(this.state.to).add(12, "hour");
        } else if (currentScale === "hour") {
            from = moment(this.state.from).add(1, "day");
            to = moment(this.state.to).add(1, "day");
        } else {
            from = moment(this.state.from).add(1, currentScale);
            to = moment(this.state.to).add(1, currentScale);
        }
        const tomorrowMidnight = moment().add(1, "day").startOf("day");
        const maximumTo = tomorrowMidnight.isBefore(to);
        this.setState({
            from: from,
            to: maximumTo ? tomorrowMidnight : to,
            maximumTo: maximumTo
        }, this.componentDidMount);
    };

    onChangeFrom = val => {
        const {scale, to} = this.state;
        let additionalState = {};
        const diff = moment.duration(to.diff(val)).asDays();
        if (scale === "minute" && diff > maxDayDiffMainMeasurements) {
            additionalState = {to: moment(val).add(maxDayDiffMainMeasurements, "day"), includeUniques: false};
        } else if (scale === "hour" && diff > maxDayDiffMainMeasurements) {
            additionalState = {to: moment(val).add(maxDayDiffMainMeasurements, "day"), includeUniques: false};
        }
        this.setState({data: [], from: val, ...additionalState}, this.componentDidMount)
    };

    onChangeTo = val => {
        const {scale, from} = this.state;
        let additionalState = {};
        const diff = moment.duration(val.diff(from)).asDays();
        if (scale === "minute" && diff > maxDayDiffMainMeasurements) {
            additionalState = {from: moment(val).add(-1 * maxDayDiffMainMeasurements, "day"), includeUniques: false};
        } else if (scale === "hour" && diff > maxDayDiffMainMeasurements) {
            additionalState = {from: moment(val).add(-1 * maxDayDiffMainMeasurements, "day"), includeUniques: false};
        }
        const tomorrowMidnight = moment().add(1, "day").startOf("day");
        const maximumTo = tomorrowMidnight.isBefore(val);
        this.setState({data: [], maximumTo: maximumTo, to: val, ...additionalState}, this.componentDidMount)
    };

    onChangeSp = val => {
        const newState = {data: [], sp: val};
        if (val === "" && this.state.noTimeFrame) {
            newState.noTimeFrame = false;
        }
        this.setState(newState, this.componentDidMount);
    };

    onChangeIdP = val => {
        const newState = {data: [], idp: val};
        if (val === "" && this.state.noTimeFrame) {
            newState.noTimeFrame = false;
        }
        this.setState(newState, this.componentDidMount);
    };

    onChangeInstitutionType = val => this.setState({institutionType: val}, this.state.groupedByIdp ? () => this : this.componentDidMount);

    onChangeState = val => this.setState({data: [], providerState: val}, this.componentDidMount);

    onChangeScale = scale => {
        const {to, groupedByIdp, groupedBySp} = this.state;
        if (groupedByIdp || groupedBySp) {
            this.setState({
                data: [],
                scale: scale,
                from: moment().subtract(1, "day").startOf("day")
            }, this.componentDidMount);
        } else {
            if (scale === "minute") {
                this.setState({
                    data: [],
                    scale: scale,
                    from: moment().subtract(24, "hour"),
                    to: moment().add(1, "day").startOf("day")
                }, this.componentDidMount);
            } else {
                const from = moment(to).subtract(minDiffByScale[scale], "day").startOf(scale);
                this.setState({
                    data: [],
                    scale: scale,
                    from: from
                }, this.componentDidMount);
            }
        }
    };

    onChangeSelectPeriod = newState => this.setState(newState, this.componentDidMount);

    onChangeUniques = e => this.setState({data: [], includeUniques: e.target.checked}, this.componentDidMount);

    onChangeGroupBySp = e => {
        let additionalState = {};
        if (!this.state.groupedByIdp && e.target.checked) {
            additionalState = this.initialStateGroupBy();
        } else if (!e.target.checked) {
            additionalState = this.initialStateNoGroupBy();
        }
        this.setState({
            data: [], groupedBySp: e.target.checked,
            groupedByIdp: false,
            institutionType: "",
            ...additionalState
        }, this.componentDidMount)
    };

    onChangeGroupByIdp = e => {
        let additionalState = {};
        if (!this.state.groupedBySp && e.target.checked) {
            additionalState = this.initialStateGroupBy();
        } else if (!e.target.checked) {
            additionalState = this.initialStateNoGroupBy();
        }
        this.setState({
            data: [], groupedByIdp: e.target.checked,
            groupedBySp: false,
            institutionType: "",
            ...additionalState
        }, this.componentDidMount);
    };

    onChangeNoTimeFrame = () => this.setState({
        noTimeFrame: !this.state.noTimeFrame,
        scale: "day"
    }, this.componentDidMount);

    onLabelClick = entityId => {
        const {groupedByIdp, groupedBySp} = this.state;
        this.setState({
            sp: groupedBySp ? entityId : "", idp: groupedByIdp ? entityId : "",
            groupedByIdp: !groupedByIdp, groupedBySp: !groupedBySp
        }, this.componentDidMount)
    };

    onDownload = e => {
        stop(e);
        if (this.state.downloading) {
            return;
        }
        this.setState({downloading: true});
        const {from, scale, providerState} = this.state;
        const period = getPeriod(from, scale === "minute" || scale === "hour" ? "year" : scale || "year");
        this.doAggregatedLogin(period, true, undefined, undefined, undefined, undefined, "idp_id,sp_id", providerState, true, true, true)
    };

    title = (from, to, aggregate, groupedBySp, groupedByIdp, scale, noTimeFrame, institutionType) => {
        const format = scale === "minute" || scale === "hour" ? "YYYY-MM-DD" : "YYYY-MM-DD";//'MMMM Do YYYY, h:mm:ss a'
        if (noTimeFrame) {
            return I18n.t("live.noTimeFrameChart", {
                from: from ? from.format(format) : "",
                to: to ? to.format(format) : "",
                scale: I18n.t(`period.${scale}`).toLowerCase(),
                institutionType: isEmpty(institutionType) ? "" : I18n.t("live.institutionType", {institutionType: institutionType})
            });
        }
        if (!aggregate) {
            return I18n.t("live.chartTitle", {
                from: from ? from.format(format) : "",
                to: to ? to.format(format) : "",
                scale: I18n.t(`period.${scale}`).toLowerCase(),
                institutionType: isEmpty(institutionType) ? "" : I18n.t("live.institutionType", {institutionType: institutionType})
            });
        }
        if (aggregate) {
            return I18n.t("live.aggregatedChartTitlePeriod", {
                period: getPeriod(from, scale),
                group: I18n.t(`providers.${groupedByIdp ? "idp" : "sp"}`),
                institutionType: isEmpty(institutionType) ? "" : I18n.t("live.institutionType", {institutionType: institutionType})
            });
        }
    };

    render() {
        const {
            data, from, to, scale, sp, idp, groupedByIdp, groupedBySp, providerState, includeUniques, download,
            matrix, institutionType, maximumTo, noTimeFrame, downloading, period
        } = this.state;
        const aggregate = groupedByIdp || groupedBySp;
        const {identityProviders, serviceProviders, user, identityProvidersDict, serviceProvidersDict} = this.props;
        let dataForChart = data;
        if (!isEmpty(institutionType) && groupedByIdp) {
            const entityIds = identityProviders.filter(idp => idp["coin:institution_type"] === institutionType).map(idp => idp.id);
            dataForChart = data.filter(idp => entityIds.indexOf(idp["idp_entity_id"]) > -1);
            if (dataForChart.length === 0) {
                dataForChart = ["no_results"];
            }
        }
        const disabled = [];
        if (isEmpty(sp) || isEmpty(idp) || groupedByIdp || groupedBySp) {
            disabled.push("noTimeframe");
        }
        if (noTimeFrame) {
            disabled.push("scale");
        }
        return (
            <div className={`live ${user.guest ? "guest" : ""}`}>
                <section className={`container ${user.guest ? "guest" : ""}`}>
                    {user.guest && <SelectPeriod onChangeSelectPeriod={this.onChangeSelectPeriod} period={period}/>}
                    {!user.guest && <Period onChangeFrom={this.onChangeFrom}
                                            onChangeTo={this.onChangeTo}
                                            onChangeScale={this.onChangeScale}
                                            from={from}
                                            to={to}
                                            scale={scale}
                                            aggregate={aggregate}
                                            noTimeFrame={noTimeFrame}
                                            disabled={disabled}
                                            changeTimeFrame={this.onChangeNoTimeFrame}/>}
                    {!user.guest && <GroupBy groupedByIdp={groupedByIdp}
                                             groupedBySp={groupedBySp}
                                             onChangeGroupByIdp={this.onChangeGroupByIdp}
                                             onChangeGroupBySp={this.onChangeGroupBySp}
                                             download={download}
                                             downloading={downloading}
                                             onDownload={this.onDownload}
                                             matrix={matrix}/>}
                    {!user.guest && <Filters onChangeState={this.onChangeState}
                                             onChangeUniques={this.onChangeUniques}
                                             state={providerState}
                                             uniques={includeUniques}
                                             displayUniques={scale !== "minute" && scale !== "hour"}
                                             onChangeSp={this.onChangeSp}
                                             onChangeIdp={this.onChangeIdP}
                                             identityProviders={identityProviders}
                                             serviceProviders={serviceProviders}
                                             idp={idp}
                                             sp={sp}
                                             onChangeInstitutionType={this.onChangeInstitutionType}
                                             institutionType={institutionType}
                                             groupedByIdp={groupedByIdp}
                                             groupedBySp={groupedBySp}/>}
                </section>
                <Chart data={dataForChart}
                       scale={scale}
                       baseUrl={user.base_url}
                       includeUniques={includeUniques}
                       title={this.title(from, to, aggregate, groupedBySp, groupedByIdp, scale, noTimeFrame, institutionType)}
                       groupedBySp={groupedBySp}
                       groupedByIdp={groupedByIdp}
                       aggregate={aggregate}
                       identityProvidersDict={identityProvidersDict}
                       serviceProvidersDict={serviceProvidersDict}
                       guest={user.guest}
                       goRight={this.goRight}
                       goLeft={this.goLeft}
                       rightDisabled={maximumTo}
                       onLabelClick={this.onLabelClick}
                       noTimeFrame={noTimeFrame}
                       reset={this.reset}/>
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