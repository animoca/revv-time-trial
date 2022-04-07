import React from 'react';
// import { useTranslation } from 'react-i18next';
import {StatProgressDial} from '../../components';
import './styles/Workshop.scss';

function LoadoutStatDial(props) {
  // const {t, i18n} = useTranslation();

  let {name,value,newValue,max} = props.data;

  const delta = newValue - value

  
  return (
    <> 
    <div className="loadout-dial-container">
        <StatProgressDial data={{value,newValue,max}}>
        <div className="delta" id={delta>0?"higher":"lower"}>{delta && delta!=0?((delta<0?"":"+") + delta):<></>}</div>
        <div className="value">{value}</div>
        </StatProgressDial>
        <div className="text">{name}</div>
    </div>
    </>
  )
}

export {LoadoutStatDial};