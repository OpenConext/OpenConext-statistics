import React from "react";
import I18n from "i18n-js";
import {connectedIdentityProviders} from "../api";
import CheckBox from "../components/CheckBox";
import "./ConnectedIdentityProviders.css";

export default class ConnectedIdentityProviders extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            connectedIdentityProviders: [],
            guestIdentityProviders: [],
            loading: true
        };
    }

    componentDidMount() {
        connectedIdentityProviders().then(res => this.setState({
            connectedIdentityProviders: res.filter(p => (p["coin:guest_qualifier"] || "None") === "None")
                .sort((a, b) => this.organizationName(a).toLowerCase().localeCompare(this.organizationName(b).toLowerCase())),
            guestIdentityProviders: res.filter(p => (p["coin:guest_qualifier"] || "None") !== "None")
                .sort((a, b) => this.organizationName(a).toLowerCase().localeCompare(this.organizationName(b).toLowerCase())),
            loading: false
        }))
        ;
    }

    organizationName = provider => I18n.locale === "en" ? provider.name_en || provider.name_nl || provider.entityid :
        provider.name_nl || provider.name_en || provider.entityid;

    render() {
        const {connectedIdentityProviders, guestIdentityProviders, loading} = this.state;
        return (
            <div className="connected-identity-providers">
                {loading && <section className="loading">
                    <em>{I18n.t("eduGain.loading")}</em>
                    <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                </section>}
                {!loading && <div className="providers">
                    <span className="title">{I18n.t("eduGain.title")}</span>
                    {this.renderConnectedProviders(["organizationName", "surfConext", "eduGAIN"], connectedIdentityProviders)}
                    {this.renderGuestProviders(["organizationName", "surfConext"], guestIdentityProviders)}
                    <div className="footer">
                    <p dangerouslySetInnerHTML={{__html: I18n.t("eduGain.footer")}}></p>
                    </div>
                </div>}
            </div>
        );
    }

    renderConnectedProviders(columns, connectedIdentityProviders) {
        return <div className="connected-providers">
            <p className="info" dangerouslySetInnerHTML={{__html: I18n.t("eduGain.info")}}></p>
            <table>
                <thead>
                <tr>
                    {columns.map(c =>
                        <th key={c} className={c}>{I18n.t(`eduGain.${c}`)}</th>
                    )}
                </tr>
                </thead>
                <tbody>
                {connectedIdentityProviders.map((p, i) => <tr key={i}>
                    <td className="organizationName">{p.name_en}</td>
                    <td className="surfConext"><CheckBox name={p.name_en} value={true} readOnly={true}/>
                    </td>
                    <td className="eduGAIN"><CheckBox name={p.name_en}
                                                      value={p["coin:publish_in_edugain"] === "1" ? true : false}
                                                      readOnly={true}/></td>
                </tr>)}

                </tbody>
            </table>
            <p className="total">{I18n.t("eduGain.total", {count: connectedIdentityProviders.length})}</p>
        </div>;
    }

    renderGuestProviders(columns, guestIdentityProviders) {
        return <div className="guests">
            <p className="info" dangerouslySetInnerHTML={{__html: I18n.t("eduGain.notFullMembers")}}></p>
            <table>
                <thead>
                <tr>
                    {columns.map(c =>
                        <th key={c} className={c}>{I18n.t(`eduGain.${c}`)}</th>
                    )}
                </tr>
                </thead>
                <tbody>
                {guestIdentityProviders.map((p, i) => <tr key={i}>
                    <td className="organizationName">{p.name_en}</td>
                    <td className="surfConext">{I18n.t("eduGain.nonMember")}
                    </td>
                </tr>)}

                </tbody>
            </table>
            <p className="total">{I18n.t("eduGain.totalNonMembers", {count: guestIdentityProviders.length})}</p>
        </div>;
    }

}