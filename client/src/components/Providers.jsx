import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import "./Providers.css";
import ProviderSelect from "./ProviderSelect";
import CheckBox from "./CheckBox";


export default class Providers extends React.PureComponent {

    render() {
        const {
            onChangeIdp, onChangeSp, serviceProviders, identityProviders, sp, idp, aggregate, onChangeAggregate,
            groupedBySp, groupedByIdp, onChangeGroupBySp, onChangeGroupByIdp
        } = this.props;
        const spSelect = (serviceProviders && serviceProviders.length > 0);
        const idpSelect = (identityProviders && identityProviders.length > 0);
        const check = (spSelect || idpSelect);
        return (
            <div className="providers">
                <span className="title">{I18n.t("providers.title")}</span>
                <section className="controls">
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
                </section>
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
    onChangeAggregate: PropTypes.func.isRequired,
    groupedByIdp: PropTypes.bool.isRequired,
    groupedBySp: PropTypes.bool.isRequired,
    onChangeGroupByIdp: PropTypes.func.isRequired,
    onChangeGroupBySp: PropTypes.func.isRequired
};


