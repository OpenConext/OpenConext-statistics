import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import "./Providers.css";
import ProviderSelect from "./ProviderSelect";
import CheckBox from "./CheckBox";
import {CSVDownload} from "react-csv";

export default class Providers extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            displayDetails: true
        };
    }

    render() {
        const {displayDetails} = this.state;
        const {
            onChangeIdp, onChangeSp, serviceProviders, identityProviders, sp, idp, aggregate, onChangeAggregate,
            groupedBySp, groupedByIdp, onChangeGroupBySp, onChangeGroupByIdp, download, matrix, onDownload
        } = this.props;
        const spSelect = (serviceProviders && serviceProviders.length > 0);
        const idpSelect = (identityProviders && identityProviders.length > 0);
        const check = (spSelect || idpSelect);
        return (
            <div className="providers">
                <span className={`title ${displayDetails ? "" : "hide"} `}
                      onClick={() => this.setState({displayDetails: !this.state.displayDetails})}>
                    {I18n.t("providers.title")}
                    </span>
                {displayDetails && <section className="controls">
                    {check && <CheckBox name="aggregate" value={aggregate}
                                        info={I18n.t("providers.aggregate")}
                                        onChange={onChangeAggregate}/>}
                    {spSelect &&
                    <ProviderSelect onChange={onChangeSp}
                                    i18nKey={"sp"}
                                    providers={serviceProviders}
                                    selectedProvider={sp}
                                    groupedBy={groupedBySp}
                                    onChangeGroupBy={onChangeGroupBySp}
                                    aggregate={aggregate}
                                    first={true}/>
                    }

                    {idpSelect &&
                    <ProviderSelect onChange={onChangeIdp}
                                    i18nKey={"idp"}
                                    providers={identityProviders}
                                    selectedProvider={idp}
                                    groupedBy={groupedByIdp}
                                    aggregate={aggregate}
                                    onChangeGroupBy={onChangeGroupByIdp}
                    />}
                    {<a href="/download" className="download button blue"
                        onClick={onDownload}>{I18n.t("providers.matrix")}</a>}
                    {download &&
                    <CSVDownload target="_parent" data={matrix} filename="sp-idp-matrix.csv"></CSVDownload>}
                </section>}
            </div>
        );
    }
}

Providers.propTypes = {
    onChangeSp: PropTypes.func.isRequired,
    onChangeIdp: PropTypes.func.isRequired,
    serviceProviders: PropTypes.array,
    identityProviders: PropTypes.array,
    sp: PropTypes.string,
    idp: PropTypes.string,
    aggregate: PropTypes.bool.isRequired,
    download: PropTypes.bool.isRequired,
    onChangeAggregate: PropTypes.func.isRequired,
    groupedByIdp: PropTypes.bool.isRequired,
    groupedBySp: PropTypes.bool.isRequired,
    onChangeGroupByIdp: PropTypes.func.isRequired,
    onChangeGroupBySp: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    matrix: PropTypes.array
};


