import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import "./Providers.css";
import ProviderSelect from "./ProviderSelect";


export default class Providers extends React.PureComponent {

    render() {
        const {onChangeIdp, onChangeSp, serviceProviders, identityProviders, sp, idp} = this.props;
        return (
            <div className="providers">
                <span className="title">{I18n.t("providers.title")}</span>
                <section className="controls">
                    {(serviceProviders && serviceProviders.length > 0) &&
                    <ProviderSelect onChange={onChangeSp}
                                    i18nKey={"sp"}
                                    providers={serviceProviders}
                                    selectedProvider={sp}
                                    first={true}/>
                    }

                    {(identityProviders && identityProviders.length > 0) &&
                    <ProviderSelect onChange={onChangeIdp}
                                    i18nKey={"idp"}
                                    providers={identityProviders}
                                    selectedProvider={idp}/>}
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
};


