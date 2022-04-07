import React, { useContext, useState } from 'react';
import {useTranslation} from 'react-i18next';
import { useParams } from 'react-router-dom';
import {LoadoutStatDial} from './LoadoutStatDial'
import { WorkshopContext } from '../../components/Context';
import {getStatMaxForLoadout} from './Helper'
import './styles/LoadoutAttributePane.scss';

const constants = require("../../services/nftConstants.json") 

function LoadoutAttributePane(props) {
    const {t, i18n} = useTranslation()
    const {selection,equipped} = props.data;
    const {category,team} = useParams();
    const {itemsData,composition} = useContext(WorkshopContext)

    const getLoadoutForTeam = (team) => {
        return Object.values(itemsData).filter((item)=>{
            return team == composition[item.tokenId]
        })
    }
    const computeOverallStatsFromLoadout = (items,ignore) => {
        const attributes = constants.RacingAttributeFields[category].reduce((result,attr)=>{
            result[attr]=0
            return result
        },{})
        items.forEach((item) => {
            const attrs = constants.RacingAttributeFields[item.tokenType]
            if(ignore==null || ignore.tokenId != item.tokenId)
            Object.keys(item.attributes).forEach((attr) => {
                if(attr in attributes)
                    attributes[attr]+=item.attributes[attr]})
        })
        return attributes
    }

    let currentAttrs, newAttrs;
    currentAttrs = computeOverallStatsFromLoadout(getLoadoutForTeam(team))
    newAttrs = currentAttrs
    if(selection && !equipped)
        newAttrs = computeOverallStatsFromLoadout([...getLoadoutForTeam(team),itemsData[selection]])
    if(selection && equipped && selection!=equipped)
        newAttrs = computeOverallStatsFromLoadout([...getLoadoutForTeam(team),itemsData[selection]],itemsData[equipped])
    
    const attributes = Object.keys(currentAttrs).map((attr) => {
    const max = getStatMaxForLoadout(constants.RacingAttributeFields["car"].indexOf(attr) != -1?"car":"driver")
    return { id:attr, name: constants.RacingAttributeFieldNames[attr], value: currentAttrs[attr], newValue:newAttrs[attr], max };
    })

    return <div className = "loadout-attribute-pane">{attributes?<>
        <LoadoutStatDial data={{name:t(attributes[0].name),value:attributes[0].value,newValue:attributes[0].newValue,max:attributes[0].max}}/>
        <LoadoutStatDial data={{name:t(attributes[1].name),value:attributes[1].value,newValue:attributes[1].newValue,max:attributes[1].max}}/>
        <LoadoutStatDial data={{name:t(attributes[2].name),value:attributes[2].value,newValue:attributes[2].newValue,max:attributes[2].max}}/>
        </>:<></>}</div>
}

export {LoadoutAttributePane};

//<LoadoutStatDial data={{name:t(attributes[3].name),value:attributes[3].value,newValue:attributes[3].newValue,max:attributes[3].max}}/>