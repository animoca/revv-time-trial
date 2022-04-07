import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './styles/StatProgressBar.scss';

import iconAccelerationUrl from '../../assets/img/workshop/icons/stat-icon-acceleration.svg'
import iconTopSpeedUrl from '../../assets/img/workshop/icons/stat-icon-topspeed.svg'
import iconGripUrl from '../../assets/img/workshop/icons/stat-icon-grip.svg'
import iconAggressionUrl from '../../assets/img/workshop/icons/stat-icon-aggression.svg'
import iconConcentrationUrl from '../../assets/img/workshop/icons/stat-icon-concentration.svg'
import iconStaminaUrl from '../../assets/img/workshop/icons/stat-icon-stamina.svg'
import iconLuckUrl from '../../assets/img/workshop/icons/stat-icon-luck.svg'



const statIconUrls = {
    "Acceleration":iconAccelerationUrl,
    "Top Speed":iconTopSpeedUrl,
    "Grip":iconGripUrl,
    "Aggression":iconAggressionUrl,
    "Concentration":iconConcentrationUrl,
    "Stamina":iconStaminaUrl,
    "Luck":iconLuckUrl
}

function StatProgressBar(props) {
  const {t, i18n} = useTranslation();

  let {name,value,newValue,max,inlineDelta} = props.data;

  const delta = newValue - value

  if(delta<0)
    [newValue, value] = [value, newValue];
  
    const deltaDiv = delta && delta!=0?<span className="value-delta" id={delta>0?"high":"low"}>{((delta<0?"":"+") + delta)}</span>:<></>

  return (
    <div className="stat-progress-bar-wrapper">
    <div className="stat-progress-bar-info">
    <div className="label">{t(name)}
    </div>
    <div className="label-image">
    <OverlayTrigger overlay={<Tooltip>{t(name)}</Tooltip>} placement="top">
        <img src={statIconUrls[name]}></img>
    </OverlayTrigger>

      
    </div>
    <div className="value">{value}
    {inlineDelta?deltaDiv:<></>}
    </div>
    </div>
    {!inlineDelta?<span className="outside-delta">{deltaDiv}</span>:<></>}
    
    <div className="stat-progress-bar-container">
      <div className="bar" id="normal" style={{width:(100*value/max)+"%"}}></div>
      <div className="bar" id={delta>0?"delta-high":"delta-low"} style={{width:(100*Math.abs(delta)/max)+"%"}}></div>
    </div>
    
    </div>
  )
}

export {StatProgressBar};

//{backgroundRepeat:"repeat-x", width:"70%", clipPath: "polygon(0px 0px,135px 0px,88px 50px,0px 50px);"}
//<img src={progressBarUrls[progress]}></img>

