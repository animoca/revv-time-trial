import React, { useContext, useState, useEffect } from 'react';
import {useTranslation} from 'react-i18next';
import {StatProgressBar} from './StatProgressBar'
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import {getRarityString,getStatMaxForItemType,getTileGlowUrlForRarity, getRarityStringCapitalized} from './Helper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getFullMetadata } from '@animoca/f1dt-core_metadata/src/utils';
import './styles/ItemAttributePane.scss';

const constants = require("../../services/nftConstants.json") 

function ItemAttributePane(props) {
    const {t, i18n} = useTranslation()
    const {category} = useParams();
    const {selection,equipped} = props.data;

    const [itemMetadata, setItemMetadata] = useState(null);
    
    useEffect( () => {
        if(selection){
            const response = getFullMetadata(selection.tokenId)
            setItemMetadata(response)
        }
    },[selection])

    let type = "car"
    if(selection)type = selection.tokenType;
    else if(equipped)type = equipped.tokenType;

    const attrNames = constants.RacingAttributeFields[type]
    const selectedAttrs = {}
    const equippedAttrs = {}
    attrNames.forEach((attr) => {
        selectedAttrs[attr]=selection.attributes[attr]
        equippedAttrs[attr]=equipped?equipped.attributes[attr]:0
    })

    let attributes = Object.keys(selectedAttrs).map((attr) => {
    const max = getStatMaxForItemType(selection.type)
    return { id:attr, name: constants.RacingAttributeFieldNames[attr], value: equippedAttrs[attr], newValue:selectedAttrs[attr], max };
    })

    return <div className = "attribute-pane">{attributes?<>
        {selection ? <div className="details"><div className="label">
        {itemMetadata?itemMetadata.name:<Spinner animation="border" variant="light" size="sm" />}</div>
        {t("Season")}<span className="season">{selection.season}</span>
        <span className="rarity" id={getRarityString(selection.rarity)}>{t(getRarityStringCapitalized(selection.rarity))}</span>
        </div>:<></>}
        <div className="progress-bars">
        <StatProgressBar data={{name:attributes[0].name,value:attributes[0].value,newValue:attributes[0].newValue,max:attributes[0].max}}/>
        <StatProgressBar data={{name:attributes[1].name,value:attributes[1].value,newValue:attributes[1].newValue,max:attributes[1].max}}/>
        <StatProgressBar data={{name:attributes[2].name,value:attributes[2].value,newValue:attributes[2].newValue,max:attributes[2].max}}/>
        <StatProgressBar data={{name:attributes[3].name,value:attributes[3].value,newValue:attributes[3].newValue,max:attributes[3].max}}/>
        </div>
        {equipped && selection && selection!=equipped?
            <div className="item-change-indicator">
                <div className="item-tile">
                <img src={equipped.images.icon}></img>
                <img id="glow" src={getTileGlowUrlForRarity(getRarityString(equipped.rarity))}></img>
                </div>
            <FontAwesomeIcon size="sm" icon={faArrowRight} />
                <div className="item-tile">
                    <img src={selection.images.icon}></img>
                    <img id="glow" src={getTileGlowUrlForRarity(getRarityString(selection.rarity))}></img>
                </div>
          </div>:<></>}
        </>:<></>}</div>
}

export {ItemAttributePane};