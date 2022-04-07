import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {Link, useParams, useLocation} from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck,faTimes, faPlus, faLock } from '@fortawesome/free-solid-svg-icons';
import { WorkshopContext } from '../../components/Context';
import { getFullMetadata } from '@animoca/f1dt-core_metadata/src/utils';

import {itemTypeToLabel,getRarityString,getTileGlowUrlForRarity} from './Helper'

import unequippedCarUrl from '../../assets/img/workshop/icons/icon-parts-car-invalid.png'
import unequippedDriverUrl from '../../assets/img/workshop/icons/icon-gear-driver-invalid.png'
import unequippedPowerUnitUrl from '../../assets/img/workshop/icons/icon-parts-powerunit-invalid.png'
import unequippedTurbochargerUrl from '../../assets/img/workshop/icons/icon-parts-turbocharger-invalid.png'
import unequippedFrontWingUrl from '../../assets/img/workshop/icons/icon-parts-frontwing-invalid.png'
import unequippedRearWingUrl from '../../assets/img/workshop/icons/icon-parts-rearwing-invalid.png'
import unequippedEnergyStoreUrl from '../../assets/img/workshop/icons/icon-parts-energystore-invalid.png'
import unequippedBrakesUrl from '../../assets/img/workshop/icons/icon-parts-brakes-invalid.png'
import unequippedTransmissionUrl from '../../assets/img/workshop/icons/icon-parts-transmission-invalid.png'
import unequippedSuspensionUrl from '../../assets/img/workshop/icons/icon-parts-suspension-invalid.png'
import unequippedGlovesUrl from '../../assets/img/workshop/icons/icon-gear-gloves-invalid.png'
import unequippedSuitUrl from '../../assets/img/workshop/icons/icon-gear-suit-invalid.png'
import unequippedHelmetUrl from '../../assets/img/workshop/icons/icon-gear-helmet-invalid.png'
import unequippedBootsUrl from '../../assets/img/workshop/icons/icon-gear-boots-invalid.png'
import { RedditIcon } from 'react-share';
import './styles/ItemTile.scss';


const unequippedUrl = {
  car:unequippedCarUrl,
  driver:unequippedDriverUrl,
  powerunit:unequippedPowerUnitUrl,
  turbocharger:unequippedTurbochargerUrl,
  frontwing:unequippedFrontWingUrl,
  rearwing:unequippedRearWingUrl,
  energystore:unequippedEnergyStoreUrl,
  brakes:unequippedBrakesUrl,
  transmission:unequippedTransmissionUrl,
  suspension:unequippedSuspensionUrl,
  gloves:unequippedGlovesUrl,
  suit:unequippedSuitUrl,
  helmet:unequippedHelmetUrl,
  boots:unequippedBootsUrl}

function ItemTile(props) {
  const {t, i18n} = useTranslation();

  const {item,selection,onSelect,revvTeamLockCar,revvTeamLockDriver} = props.data;

  const {team} = useParams();
  
  const {itemsData,composition} = useContext(WorkshopContext)

  const [itemMetadata, setItemMetadata] = useState(null);

  useEffect( () => {
    const response = getFullMetadata(item)
    setItemMetadata(response)
  },[item])

  const getClassName = () =>
  {
    return selection==item?"item-tile selected":"item-tile";
  }
  
  const rarityImageUrl = getTileGlowUrlForRarity(getRarityString(itemsData[item].rarity))

  const equipped = composition[item]

  const isItemLocked = () => {
    if(itemsData[item].type != "car" && itemsData[item].type != "driver")return

    if(itemsData[item].type == "car" && revvTeamLockDriver!=null)
      if(itemsData[item].teamId!=null && itemsData[item].teamId!=revvTeamLockDriver)
        return true
    
    if(itemsData[item].teamId!=null && itemsData[item].type == "driver" && revvTeamLockCar!=null)
      if(itemsData[item].teamId!=revvTeamLockCar)
        return true
        
    return false
  }
  
  const isLocked = isItemLocked()
//getItemImageUrlFromTokenId(item)
  return (
    <>  
    <div className={getClassName()}>
    {equipped!=null && equipped!=team?<div className="center" id="assignedTo">{t("Team") + " " + (equipped)}</div>:<></>}
    {equipped!=null && equipped==team?<div className="center"><FontAwesomeIcon size="lg" icon={faCheck} /></div>:<></>}
    {isLocked?<div className="icon"><FontAwesomeIcon size="sm" icon={faLock} /> </div>:<></>}
    <div className="image">
      <img id="rarity" src={rarityImageUrl}></img>
      <img src={itemsData[item].images.icon}></img></div>
    <div className="label">{itemMetadata?itemMetadata.name:<Spinner animation="border" variant="light" size="sm" />}</div>
    {(equipped!=null && equipped!=team) || isLocked?<span className="overlay"></span>:<></>}
    <div className="click-area" onClick={()=>onSelect(item)}></div>
    <span className="overlay" id="fade"></span>
    <span className="overlay" id="fade-hover"></span>
    </div>
    </>
  )
}

function CompositionItemTile(props) {
  const {t, i18n} = useTranslation();
  const [rarityImageUrl, setRarityImageUrl] = useState(null);

  const {item,type,unequip} = props.data;
  const {itemsData} = useContext(WorkshopContext)
  const {season,team,category} = useParams()
  
  const [itemMetadata, setItemMetadata] = useState(null);

  useEffect( () => {
    if(item){
      const response = getFullMetadata(item)
      setRarityImageUrl(getTileGlowUrlForRarity(response.core_attributes.rarityTier.toLowerCase()))
      setItemMetadata(response)
    } else {
      setRarityImageUrl(null)
    }
  },[item])

  const baseUrl = useLocation().pathname.split('/')[1]
  //{equipped == null && itemsData[item].upgrade?<div className="item-tile-icon" id="upgrade"><FontAwesomeIcon size="lg" icon={faAngleDoubleUp} /></div>:<></>}
  return (
    <> 
    <div className="item-tile" id={category=="driver"?"driver-composition":""}>
    <div className="image">
      <img id="rarity" src={rarityImageUrl}></img>
      {itemsData[item]?<img src={itemsData[item].images.icon}></img>:
      <img src={unequippedUrl[type]}></img>}
      
      </div>
    {item?<>
    <div className="label composition" onClick={()=>unequip(item)}>
      {itemMetadata?itemMetadata.name:<Spinner animation="border" variant="light" size="sm" />}
    </div>
    <div className="label composition-unequip">
      <FontAwesomeIcon size="sm" icon={faTimes} /> {t("UNEQUIP")}
    </div>
    
    </>:<>
      
      <div className="label">
      {t(itemTypeToLabel(type))}</div>
    </>}
    <Link to={`/${baseUrl}/${season}/${team}/${category}/${type}`}><div className="click-area"></div></Link>
    <span className="overlay" id="fade"></span>
    <span className="overlay" id="fade-hover"></span>
    </div>
    </>
  )
}

function TyreItemTile(props){
  const {t, i18n} = useTranslation();

  const {item,selection,equipped,onSelect} = props.data;

  const [itemMetadata, setItemMetadata] = useState(null);

  useEffect( () => {
    const response = getFullMetadata(item.tokenId)
    setItemMetadata(response)
  },[item.tokenId])

  const getClassName = () =>
  {
    return selection==item.tokenId?"item-tile selected":"item-tile";
  }
  
  const rarityImageUrl = getTileGlowUrlForRarity(getRarityString(item.rarity))

  return (
    <>  
    <div className={getClassName()}>
    {equipped==item.tokenId?<div className="center"><FontAwesomeIcon size="lg" icon={faCheck} /></div>:<></>}
    <div className="image">
      <img id="rarity" src={rarityImageUrl}></img>
      <img src={item.images.icon}></img></div>
    <div className="label">{itemMetadata?itemMetadata.name:<Spinner animation="border" variant="light" size="sm" />}</div>
    {equipped==item.tokenId?<span className="overlay"></span>:<></>}
    <div className="click-area" onClick={()=>onSelect(item.tokenId)}></div>
    {equipped==item.tokenId?<span className="overlay equipped" id="fade"></span>:<span className="overlay" id="fade"></span>}
    <span className="overlay" id="fade-hover"></span>
    </div>
    </>
  )
}
//<span className="composition-tile-unequip-label"><FontAwesomeIcon size="sm" icon={faTimes} /> {t("UNEQUIP")}</span>
function ItemTileAddMore(props) {
  const {t, i18n} = useTranslation();
  const {subType} = props.data;
  //TODO Fix link to add more
  return (
    <>  
    <div className="item-tile" id="add-more">
    <div className="center"><FontAwesomeIcon size="lg" icon={faPlus} /></div>
    <div className="bottom">{t("Add More")}</div>
    <div className="image">
      <img src={unequippedUrl[subType]}></img>
    </div>
    <Link to={`/shop`}><div className="click-area"></div></Link>
    </div>
    </>
  )
}

export {ItemTile,ItemTileAddMore,CompositionItemTile,TyreItemTile};