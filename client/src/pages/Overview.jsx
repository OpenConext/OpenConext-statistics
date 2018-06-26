import React from "react";
import PropTypes from "prop-types";
import {loginTimeFrame} from "../api";
import I18n from "i18n-js";
import "./Overview.css";
import Providers from "../components/Providers";
import Chart from "../components/Chart";

export default class Overview extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            sp: undefined,
            idp: undefined
        };
    }

    componentDidMount() {
        loginTimeFrame({
            from: Math.round(new Date(new Date().getUTCFullYear(), 0, 1).getTime() / 1000),
            include_unique: true
        }).then(res => this.setState({data: res}));
    }


    renderProviders = (identityProviders, idp, serviceProviders, sp) => {
        return <Providers onChangeSp={val => this.setState({sp: val})}
                          onChangeIdp={val => this.setState({idp: val})}
                          identityProviders={identityProviders}
                          serviceProviders={serviceProviders}
                          idp={idp}
                          sp={sp}/>
    };

    render() {
        const {data, sp, idp} = this.state;
        const {identityProviders, serviceProviders} = this.props;
        return (
            <div className="overview">
                {this.renderProviders(identityProviders, idp, serviceProviders, sp)}
                <Chart data={data}
                       includeUniques={true}
                       title={I18n.t("plot.title")}
                       scale={"day"}/>
            </div>
        );
    }
}

Overview.propTypes = {
    identityProviders: PropTypes.array.isRequired,
    serviceProviders: PropTypes.array.isRequired
};

