import React from 'react';
import './StatProgressDial.scss';

import shineUrlGreen from '../../assets/img/workshop/flare-green.png'
import shineUrlRed from '../../assets/img/workshop/flare-red.png'

import shineUrlGreenSmall from '../../assets/img/workshop/flare-green-small.png'
import shineUrlRedSmall from '../../assets/img/workshop/flare-red-small.png'

const percToDeg = percentage => Math.min(180, Math.round(percentage / 100 * 360));

function StatProgressDial(props) {
    let {value,newValue,max} = props.data;
    let leftStyle, rightStyle,leftStyle2, rightStyle2;
    value = 100*value/max;
    newValue = 100*newValue/max


    const delta = newValue - value
    if(delta<0)
        [newValue,value] = [value,newValue]

    if (value > 0) {
        if( value <= 50) {
            rightStyle = { transform: `rotate(${percToDeg(value)}deg)` }
        } else {
            rightStyle = { transform: `rotate(180deg)`}
            leftStyle = { transform: `rotate(${percToDeg(value - 50)}deg)`}
        }
    }

    if (newValue > 0) {
        if( newValue <= 50) {
            rightStyle2 = { transform: `rotate(${percToDeg(newValue)}deg)` }
        } else {
            rightStyle2 = { transform: `rotate(180deg)`}
            leftStyle2 = { transform: `rotate(${percToDeg(newValue - 50)}deg)`}
        }
    }

    let shineStyle,shineSpanClassName,shineImgClassName,shineVisible;
    if(delta>0){
        shineStyle = newValue<=50?rightStyle2:leftStyle2;
        shineSpanClassName = newValue<=50?"progress-right":"progress-left";
        shineImgClassName = newValue<=50?"shine-right":"shine-left";
        shineVisible=newValue!=0
    }else{
        shineStyle = value<=50?rightStyle:leftStyle;
        shineSpanClassName = value<=50?"progress-right":"progress-left";
        shineImgClassName = value<=50?"shine-right":"shine-left";
        shineVisible=value!=0
    }
    
    return (
        <div className="stat-progress-dial">
            {newValue!=value?<>
            <span className="progress-left">
                <span className="progress-bar border-primary" id={delta>0?"higher":"lower"} style={leftStyle2}></span>
            </span>
            <span className="progress-right">
                <span className="progress-bar border-primary" id={delta>0?"higher":"lower"} style={rightStyle2}></span>
            </span></>:<></>}
            <span className="progress-left">
                <span className="progress-bar border-primary" style={leftStyle}></span>
            </span>
            <span className="progress-right">
                <span className="progress-bar border-primary" style={rightStyle}></span>
            </span>
            
            {shineVisible?
            <span className={shineSpanClassName} id="shine">
                <span className="progress-bar" id="shine" style={shineStyle}>
                    <img className={shineImgClassName} id="default" src={delta>0?shineUrlGreen:shineUrlRed}></img>
                    <img className={shineImgClassName} id="small" src={delta>0?shineUrlGreenSmall:shineUrlRedSmall}></img>
                    </span>
            </span>:<></>}



            <div className="progress-value d-flex">{props.children}</div>
        </div>
    )
}

export {StatProgressDial};