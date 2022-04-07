import React, { useContext, useState, useEffect } from 'react';
import {useTranslation} from 'react-i18next';
import {StatProgressBar} from './StatProgressBar'
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import { getFullMetadata } from '@animoca/f1dt-core_metadata/src/utils';
import {getRarityString,getRarityStringCapitalized,getStatMaxForItemType,itemTypeToLabel} from './Helper'
import './styles/BottomAttributePane.scss';


const constants = require("../../services/nftConstants.json")


function BottomAttributePane(props) {
    const {t, i18n} = useTranslation()
    const {category,subCategory} = useParams();
    const {selection,equipped} = props.data;
    const {itemsData} = useContext(WorkshopContext)

    const [itemMetadata, setItemMetadata] = useState(null);

    const availableItem = selection?selection:equipped;

    useEffect( () => {
        if(!availableItem){
            setItemMetadata({name:subCategory == "select" ? category : itemTypeToLabel(subCategory)})
            return
        }
        const response = getFullMetadata(availableItem)
        setItemMetadata(response)
    },[availableItem])
    
    const attrs = constants.RacingAttributeFields[category]
    const selectedAttrs = {}
    const equippedAttrs = {}
    attrs.forEach((attr) => {
        equippedAttrs[attr]=equipped?itemsData[equipped].attributes[attr]:0
        selectedAttrs[attr]=selection?itemsData[selection].attributes[attr]:equippedAttrs[attr]
    })
    
    let attributes = Object.keys(selectedAttrs).map((attr) => {
    const max = availableItem?getStatMaxForItemType(itemsData[availableItem].type):1;
    return { id:attr, name: constants.RacingAttributeFieldNames[attr], value: equippedAttrs[attr], newValue:selectedAttrs[attr], max };
    })
    
    if(!availableItem)return <></>

    return <div className = "bottom-attribute-pane">{attributes?<>
        {availableItem ? <div className="details"><div className="label">
        {itemMetadata?itemMetadata.name:<Spinner animation="border" variant="light" size="sm" />}</div>
        {t("Season")}<span className="season">{itemsData[availableItem].season}</span>
        <span className="rarity" id={getRarityString(itemsData[availableItem].rarity)}>{t(getRarityStringCapitalized(itemsData[availableItem].rarity))}</span>
        </div>:<></>}
        
        <div className="stat-bars">
        <StatProgressBar data={{name:attributes[0].name,value:attributes[0].value,newValue:attributes[0].newValue,max:attributes[0].max,inlineDelta:true}}/>
        <StatProgressBar data={{name:attributes[1].name,value:attributes[1].value,newValue:attributes[1].newValue,max:attributes[1].max,inlineDelta:true}}/>
        <StatProgressBar data={{name:attributes[2].name,value:attributes[2].value,newValue:attributes[2].newValue,max:attributes[2].max,inlineDelta:true}}/>
        <StatProgressBar data={{name:attributes[3].name,value:attributes[3].value,newValue:attributes[3].newValue,max:attributes[3].max,inlineDelta:true}}/>
        </div>
        </>:<></>}</div>
}

export {BottomAttributePane};