import React from "react";
import {loginTimeFrame} from "../api";
import I18n from "i18n-js";
import "./Live.css";
import Period from "../components/Period";
import moment from "moment";
import Chart from "../components/Chart";
import PropTypes from "prop-types";
import Providers from "../components/Providers";

export default class Live extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            from: moment().subtract(7, "day").startOf("day"),
            to: moment().startOf("day"),
            scale: "hour",
            sp: undefined,
            idp: undefined,
            groupedByIdp: false,
            groupedBySp: false
        };
    }

    componentDidMount() {
        const {from, to, scale, idp, sp, groupedByIdp, groupedBySp} = this.state;
        const {user} = this.props;
        const groupBy = (groupedByIdp || groupedBySp) ? `${groupedBySp ? "sp_id" : ""},${groupedByIdp ? "idp_id" : ""}` : undefined;
        loginTimeFrame({
            from: from.utc().unix(),
            to: to.utc().unix(),
            include_unique: !user.guest,
            scale: scale,
            idp_entity_id: idp,
            sp_entity_id: sp,
            group_by: groupBy
        }).then(res => this.setState({data: res}));

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
        this.setState({data: [], sp: val},
            () => this.componentDidMount());
    };

    onChangeIdP = val => {
        this.setState({data: [], idp: val},
            () => this.componentDidMount());
    };

    onChangeScale = scale => {
        this.setState({data: [], scale: scale},
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

    renderPeriodAndProviders = (from, to, scale, identityProviders, idp, serviceProviders, sp, user,
                                groupedByIdp, groupedBySp, onChangeGroupByIdp, onChangeGroupBySp) => {
        return (
            <section className="container">
                {!user.guest && <Providers onChangeSp={this.onChangeSp}
                                           onChangeIdp={this.onChangeIdP}
                                           identityProviders={identityProviders}
                                           serviceProviders={serviceProviders}
                                           idp={idp}
                                           sp={sp}
                                           groupedByIdp={groupedByIdp}
                                           groupedBySp={groupedBySp}
                                           onChangeGroupByIdp={onChangeGroupByIdp}
                                           onChangeGroupBySp={onChangeGroupBySp}/>}
                <Period onChangeFrom={this.onChangeFrom}
                        onChangeTo={this.onChangeTo}
                        onChangeScale={this.onChangeScale}
                        from={from}
                        to={to}
                        scale={scale}/>
            </section>
        );
    };

    render() {
        const {data, from, to, scale, sp, idp, groupedByIdp, groupedBySp} = this.state;
        const {identityProviders, serviceProviders, user} = this.props;
        return (
            <div className="live">
                {this.renderPeriodAndProviders(from, to, scale, identityProviders, idp, serviceProviders, sp, user,
                    groupedByIdp, groupedBySp, this.onChangeGroupByIdp, this.onChangeGroupBySp)}
                <Chart data={data}
                       includeUniques={!user.guest}
                       title={I18n.t("live.chartTitle", {scale: scale})}
                       scale={scale}/>
            </div>
        );
    }
}

Live.propTypes = {
    identityProviders: PropTypes.array.isRequired,
    serviceProviders: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired
};