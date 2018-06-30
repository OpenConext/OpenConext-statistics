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
        const {from, to, scale, idp, sp, aggregate, groupedBySp, groupedByIdp} = this.state;
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
            }).then(res => this.setState({data: res}));
        } else {
            loginTimeFrame({
                from: from.utc().unix(),
                to: to.utc().unix(),
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
        this.setState({data: [], to: val},
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
        this.setState({data: [], scale: scale},
            () => this.componentDidMount());
    };

    onChangeAggregate = e => {
        const aggregate = e.target.checked;
        this.setState({
                data: [],
                aggregate: aggregate,
                scale: aggregate ? "none" : this.state.scale,
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
                       title={I18n.t("live.chartTitle", {scale: scale})}
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