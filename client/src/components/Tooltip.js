import React from "react";
import informational from "../icons/alert-information-circle.svg";
import "./Tooltip.scss";
import Tippy from '@tippyjs/react';

const TooltipIcon = ({tooltip, name, label}) => {
    return <>
            <span className="tool-tip-section">
                {label && <label htmlFor={name}>{label}</label>}
                <Tippy content={<span dangerouslySetInnerHTML={{
                    __html: tooltip
                }}/>}>
                <button>
                     <img src={informational} alt="" aria-hidden="true"/>
                </button>
                </Tippy>
            </span>
    </>

}

export default TooltipIcon;
