import React from "react";
import PropTypes from "prop-types";

import {Checkbox} from "@surfnet/sds";


export default class CheckBox extends React.PureComponent {

    render() {
        const {name, value, readOnly = false, onChange = e => this, info, tooltip, className = "checkbox"} = this.props;
        return (
            <div className={className}>
                <Checkbox name={name} value={value} onChange={onChange} readOnly={readOnly} info={info}
                          tooltip={tooltip}/>
            </div>
        );
    }
}

CheckBox.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    info: PropTypes.string,
    tooltip: PropTypes.string,
    className: PropTypes.string,
    autofocus: PropTypes.bool
};


