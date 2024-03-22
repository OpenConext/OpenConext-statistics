import React from "react";
import "./CheckBox.scss";
import {ReactComponent as CheckIcon} from "../icons/check.svg";
import Tooltip from "./Tooltip";

export default function CheckBox({name, value, info, onChange, toolTip = null, readOnly = false}) {

    return (
        <div className="checkbox">
            <input type="checkbox"
                   id={name}
                   name={name}
                   checked={value}
                   onChange={onChange}
                   disabled={readOnly}/>
            <label htmlFor={name}>
                <button disabled={readOnly} onClick={e => onChange({target: {checked: !value}})}>
                    <CheckIcon/>
                </button>

            </label>
            {info && <span>
                    <label htmlFor={name} className={`info ${readOnly ? "disabled" : ""}`}
                           dangerouslySetInnerHTML={{__html: info}}/>
                    {toolTip && <Tooltip tooltip={toolTip} name={name} label={""}/>}
                </span>}
        </div>
    );
}
