import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Modal, Button, Dropdown, Pagination } from 'react-bootstrap';
import { StatProgressDial } from '../../components';
import { getFullMetaDataFromTokenId } from '../../services/nftData'
import { getStatMaxForLoadout, getStatMaxForItemType } from '../Workshop/Helper'

const constants = require("../../services/nftConstants.json")

const UnequippedImages = {
  //#region NFT_IMAGES
  // car: require('./img/car-unequip.jpg'), 
  // driver: require('./img/driver-unequip.jpg'), 
  // tyres: require('./img/tyre-unequip.jpg') 
  //#endregion NFT_IMAGES
}

const unEquippedAttr = {
  'car': {
    topSpeed: 0,
    acceleration: 0,
    grip: 0
  },
  'driver': {
    stamina: 0,
    aggression: 0,
    concentration: 0
  },
  'tyre': {
    topSpeed: 0,
    acceleration: 0,
    grip: 0
  }
}

function ItemPane(props) {
  const { t, i18n } = useTranslation();
  const { type, composition } = props.data
  const [tokenId, setTokenId] = useState(null)
  const [attributes, setAttributes] = useState(unEquippedAttr[type])
  const [itemData, setItemData] = useState(null)

  useEffect(() => {
    if (composition && composition[type].tokenId) {
      setTokenId(composition[type].tokenId)
      setAttributes(composition[type].attributes)
      setItemData(getFullMetaDataFromTokenId(composition[type].tokenId))
    } else {
      setTokenId(null)
      setItemData(null);
      setAttributes(unEquippedAttr[type])
    }
  }, [composition])

  // useEffect(() => {
  //   if (!tokenId) {
  //     setItemData(null);
  //   }
  // }, [tokenId])

  return <>
    <div className="item-pane desktop">
      <div className="details">
        {<div className="label">{itemData ? itemData.name : `Equip Your ${type}`}</div>}
        {itemData && tokenId ?
          <>Season <span className="season">{itemData.season}</span><span className="rarity" id={itemData.tier}>{itemData.tier}</span></>
          : <></>}
      </div>

      {itemData ? <div className="image desktop-only"><img src={itemData.image}></img></div> : <div className="image"><img src={UnequippedImages[type]}></img></div>}
      {<div className="attribute-dials">
        {Object.keys(attributes).map(attr => {
          return <div className="loadout-dial-container" key={attr} >
            <StatProgressDial data={{ value: attributes[attr], newValue: attributes[attr], max: getStatMaxForLoadout(type) }}>
              {attributes[attr]}
            </StatProgressDial>
            <div className="text">{t(constants.RacingAttributeFieldNames[attr])}</div>
          </div>
        })}
      </div>}
    </div>
    <div className="item-pane mobile">
      <div className="left">
        {itemData ? <div className="image"><img src={itemData.image}></img></div> : <div className="image"><img src={UnequippedImages[type]}></img></div>}
      </div>
      <div className="right">
        <div className="details">
          {<div className="label">{itemData ? itemData.name : `Equip Your ${type}`}</div>}
          {itemData && tokenId ?
            <>Season <span className="season">{itemData.season}</span><span className="rarity" id={itemData.tier}>{itemData.tier}</span></>
            : <></>}
        </div>
        {<div className="attribute-dials">
          {Object.keys(attributes).map(attr => {
            return <div className="loadout-dial-container" key={attr} >
              <StatProgressDial data={{ value: attributes[attr], newValue: attributes[attr], max: getStatMaxForLoadout(type) }}>
                {attributes[attr]}
              </StatProgressDial>
              <div className="text">{t(constants.RacingAttributeFieldNames[attr])}</div>
            </div>
          })}
        </div>}
      </div>
    </div>
  </>
}


function TyreItemPane(props) {
  const { t, i18n } = useTranslation();
  let { tokenId, showTyreSelectionScreen, tyresData } = props.data
  const [attributes, setAttributes] = useState(unEquippedAttr['tyre'])

  useEffect(() => {
    if (tyresData && tyresData.attributes) {
      setAttributes(tyresData.attributes)
    }
  }, [tyresData])

  return <>
    <div className="item-pane desktop">
      {showTyreSelectionScreen ? <Button variant="revv" size="sm" onClick={showTyreSelectionScreen}>{t(tokenId ? "Change" : "Equip")}</Button> : <></>}
      <div className="details">
        {<div className="label">{tyresData ? tyresData.name : 'Equip Your Tyre'}</div>}
        {tyresData && tokenId ?
          <>Season <span className="season">{tyresData.season}</span><span className="rarity" id={tyresData.tier}>{tyresData.tier}</span></>
          : <></>}
      </div>
      {/* #region NFT_IMAGES
      {tyresData ? <div className="image"><img src={tyresData.image}></img></div> : <div className="image"><img src={UnequippedImages["tyres"]}></img></div>} */}
      {<div className="attribute-dials">
        {Object.keys(attributes).map(attr => {
          return <div className="loadout-dial-container" key={attr} ><StatProgressDial data={{ value: attributes[attr], newValue: attributes[attr], max: getStatMaxForItemType("tyres") }}>
            {attributes[attr]}</StatProgressDial><div className="text">{t(constants.RacingAttributeFieldNames[attr])}</div></div>
        })}
      </div>}
    </div>
    <div className="item-pane mobile">
      <div className="left">
        {/* #region NFT_IMAGES
        {tyresData ? <div className="image"><img src={tyresData.image}></img></div> : <div className="image"><img src={UnequippedImages["tyres"]}></img></div>} */}
      </div>
      <div className="right">
        {showTyreSelectionScreen ? <Button variant="revv" size="sm" onClick={showTyreSelectionScreen}>{t(tokenId ? "Change" : "Equip")}</Button> : <></>}
        <div className="details">
          {<div className="label">{tyresData ? tyresData.name : 'Equip Your Tyre'}</div>}
          {tyresData && tokenId ?
            <>Season <span className="season">{tyresData.season}</span><span className="rarity" id={tyresData.tier}>{tyresData.tier}</span></>
            : <></>}
        </div>
        {<div className="attribute-dials">
          {Object.keys(attributes).map(attr => {
            return <div className="loadout-dial-container" key={attr} ><StatProgressDial data={{ value: attributes[attr], newValue: attributes[attr], max: getStatMaxForItemType("tyres") }}>
              {attributes[attr]}</StatProgressDial><div className="text">{t(constants.RacingAttributeFieldNames[attr])}</div></div>
          })}
        </div>}
      </div>
    </div>
  </>
}


export { ItemPane, TyreItemPane }