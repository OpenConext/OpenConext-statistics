import React from "react";
import I18n from "i18n-js";
import "./Advanced.css";
import PropTypes from "prop-types";
import Period from "../components/Period";
import moment from "moment";
import {allowedAggregatedScales} from "../utils/Time";
import "moment/locale/nl";
import Filters from "../components/Filters";
import {firstLoginTime} from "../api";
import ProviderTable from "../components/ProviderTable";
import {isEmpty, providerName} from "../utils/Utils";

moment.locale(I18n.locale);

export default class Advanced extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            // from: moment().utc().startOf("quarter"),
            // to: moment().utc().startOf("day"),
            from: moment().utc().year(2015).startOf("year"),
            to: moment().utc().year(2015).endOf("year"),
            scale: "none",
            provider: "sp",
            state: "all",
            loaded: false,
            modus: "newcomers"
        };
    }

    componentDidMount() {
        const {from, to, provider, state} = this.state;
        firstLoginTime({
            from: from.utc().unix(),
            to: to.utc().unix(),
            state: state,
            provider: provider
        }).then(data => {
            const {serviceProvidersDict, identityProvidersDict} = this.props;
            const {provider} = this.state;
            const isSp = provider === "sp";
            const property = isSp ? "sp_entity_id" : "idp_entity_id";
            const dict = isSp ? serviceProvidersDict : identityProvidersDict;
            data.forEach(p => {
                p.name = providerName(dict[p[property]], p[property]);
                p.state = state === "all" ? "" : state;
            });
            this.setState({data: data, loaded: true});
        });
    }

    onChangeFrom = val => {
        this.setState({from: val, scale: "none"}, () => this.componentDidMount());
    };

    onChangeTo = val => {
        this.setState({to: val, scale: "none"}, () => this.componentDidMount());
    };

    onChangeProvider = val => {
        this.setState({provider: val}, () => this.componentDidMount());
    };

    onChangeState = val => {
        this.setState({state: val}, () => this.componentDidMount());
    };

    onChangeScale = scale => {
        if (scale !== "none") {
            const {from} = this.state;
            const to = moment(from);
            to.utc().endOf(scale);
            from.utc().startOf(scale);
            this.setState({scale: scale, to: to, from: from}, () => this.componentDidMount());
        } else {
            this.setState({scale: scale});
        }
    };

    render() {
        const {data, from, to, scale, state, provider, loaded, modus} = this.state;
        const {identityProvidersDict, serviceProvidersDict} = this.props;
        const title = I18n.t(`advanced.${modus}.title`, {
            from: from.format('MMMM Do YYYY, h:mm:ss a'),
            to: to.format('MMMM Do YYYY, h:mm:ss a'),
            provider: I18n.t(`providers.${provider}`)
        });
        return (
            <div className="advanced">
                <section className="container">
                    <Period onChangeFrom={this.onChangeFrom}
                            onChangeTo={this.onChangeTo}
                            onChangeScale={this.onChangeScale}
                            from={from}
                            to={to}
                            scale={scale || "none"}
                            allowedScales={allowedAggregatedScales.concat(["none"])}/>
                    <Filters displayProvider={true}
                             onChangeProvider={this.onChangeProvider}
                             provider={provider}
                             onChangeState={this.onChangeState}
                             state={state}
                             displayUniques={false}/>
                </section>
                {(isEmpty(data) && loaded) && <span>{I18n.t("providerTable.noResults")}</span>}
                {(!isEmpty(data) && loaded) &&
                <section className="content">
                    <span className="title">{title}</span>
                    <ProviderTable provider={provider}
                                   data={data}
                                   serviceProvidersDict={serviceProvidersDict}
                                   identityProvidersDict={identityProvidersDict}/>

                </section>}
            </div>
        );
    }

}

Advanced.propTypes = {
    serviceProvidersDict: PropTypes.object.isRequired,
    identityProvidersDict: PropTypes.object.isRequired
};