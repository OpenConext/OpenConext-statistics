import React from "react";
import {loginAggregated, loginTimeFrame} from "../api";
import I18n from "i18n-js";
import "./Advanced.css";
import Period from "../components/Period";
import moment from "moment";
import Chart from "../components/Chart";
import PropTypes from "prop-types";
import Providers from "../components/Providers";
import {isEmpty} from "../utils/Utils";
import {allowedAggregatedScales, getPeriod} from "../utils/Time";
import "moment/locale/nl";
import Filters from "../components/Filters";

moment.locale(I18n.locale);

export default class Advanced extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            from: moment().utc().subtract(31, "day").startOf("day"),
            to: moment().utc().startOf("day"),
            scale: "none"
        };
    }

    componentDidMount() {
        const {from, to, scale} =
            this.state;
        const period = getPeriod(from, scale);
    }

    onChangeFrom = val => {
        this.setState({data: [], from: val},
            () => this.componentDidMount());
    };

    onChangeTo = val => {
        this.setState({data: [], to: val, scale: this.state.aggregate && val ? "none" : this.state.scale},
            () => this.componentDidMount());
    };

    onChangeState = val => {
        this.setState({data: [], providerState: val},
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

    title = (from, to, scale, sp, idp, aggregate) => {
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
        const {data, from, to, scale, sp, idp, aggregate, groupedByIdp, groupedBySp, providerState} = this.state;
        const {identityProviders, serviceProviders, user, identityProvidersDict, serviceProvidersDict} = this.props;
        return (
            <div className="advanced">
                <section className="container">
                    <Period onChangeFrom={this.onChangeFrom}
                            onChangeTo={this.onChangeTo}
                            onChangeScale={this.onChangeScale}
                            from={from}
                            to={to}
                            scale={scale}
                            allowedScales={allowedAggregatedScales}/>
                    <Filters onChangeState={this.onChangeState}
                                             onChangeUniques={this.onChangeUniques}
                                             state={providerState}
                                             hideUniques={true}/>
                </section>
                <Chart data={data}
                       scale={scale}
                       includeUniques={includeUniques}
                       title={this.title(from, to, scale, sp, idp, aggregate)}
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

Advanced.propTypes = {
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired
};