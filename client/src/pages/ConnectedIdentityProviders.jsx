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
            sorted: "organizationName",
            reverse: false
        };
    }

    componentDidMount() {
        connectedIdentityProviders().then(res => this.setState({
            connectedIdentityProviders: res.filter(p => (p["coin:guest_qualifier"] || "None") === "None"),
            guestIdentityProviders: res.filter(p => (p["coin:guest_qualifier"] || "None") !== "None"),
        }));
    }

    sortTable = name => () => {
        // const {connectedIdentityProviders, sorted, reverse} = this.state;
    };

    render() {
        const {connectedIdentityProviders, guestIdentityProviders, sorted, reverse} = this.state;
        const loading = connectedIdentityProviders.length === 0;
        const columns = ["organizationName", "surfConext", "eduGAIN"];
        const icon = name => {
            return name === sorted ? (reverse ? <i className="fa fa-arrow-up reverse"></i> :
                <i className="fa fa-arrow-down current"></i>)
                : <i className="fa fa-arrow-down"></i>;
        };
        return (
            <div className="connected-identity-providers">
                {loading && <section className="loading">
                    <em>{I18n.t("eduGain.loading")}</em>
                    <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                </section>}
                {!loading && <div className="providers">
                    <span className="title">{I18n.t("eduGain.title")}</span>
                    <div className="content">
                        <p className="info" dangerouslySetInnerHTML={{__html: I18n.t("eduGain.info")}}></p>
                        <table>
                            <thead>
                            <tr>
                                {columns.map(c =>
                                    <th key={c} className={c}
                                        onClick={this.sortTable(c)}>{I18n.t(`eduGain.${c}`)}{icon(c)}</th>
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {connectedIdentityProviders.map((p, i) => <tr key={i}>
                                <td className="organizationName">{p.name_en}</td>
                                <td className="surfConext"><CheckBox name={p.name_en} value={true} readOnly={true}/>
                                </td>
                                <td className="eduGAIN"><CheckBox name={p.name_en} value={p["coin:publish_in_edugain"]}
                                                                  readOnly={true}/></td>
                            </tr>)}

                            </tbody>
                        </table>
                        <p className="total">{I18n.t("eduGain.total", {total: connectedIdentityProviders.length})}</p>
                        <p className="not-full-members"
                           dangerouslySetInnerHTML={{__html: I18n.t("eduGain.notFullMembers")}}></p>
                        {guestIdentityProviders.length > 0 &&
                        <p className="totalNonMembers">{I18n.t("eduGain.totalNonMembers", {total: guestIdentityProviders.length})}</p>}
                    </div>
                </div>}
            </div>
        );
    }
}