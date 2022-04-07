import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {Link, useParams, useLocation} from 'react-router-dom';
import {  Button,Modal } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import {ItemAttributePane} from './ItemAttributePane'
import {equipItem,unequipItem} from '../../services/workshopService'
import {getUnequippedImageUrlForItemType,getPreviewItemHaloUrl,capitalize,teamLogos} from './Helper'
import './styles/ItemPreviewPane.scss';


function ItemPreviewPane(props) {
  const {t, i18n} = useTranslation();

  const {itemsData,composition,setComposition} = useContext(WorkshopContext)
  const {selection,equipped,categoryMainItem,setItemGalleryModalVisible,itemGalleryModalVisible} = props.data;
  const {season, team, category, subCategory} = useParams();
  const baseUrl = useLocation().pathname.split('/')[1]
  const [equipConflicts,setEquipConflicts] = useState({})

  const hideConfirmModal = () => {
    setEquipConflicts({})
  }

  const onShowItemGalleryModal = () => {
    setItemGalleryModalVisible(true)
  }
  
  const onEquipButton = async () => {
    if(selection==equipped){
      const result = await unequipItem(season, selection)
      if(result)
        setComposition(result)
    }else{
      const revvTeamConflictItem = itemsData[selection].teamId?Object.keys(itemsData).find((token)=>{
        if(team != composition[token]) return false;
        
        return itemsData[selection].type!=itemsData[token].type &&
          itemsData[token].teamId &&
          itemsData[token].teamId!=itemsData[selection].teamId
      }):null
      const revvTeamConflict = revvTeamConflictItem?itemsData[revvTeamConflictItem].type:null;
      const teamSwapConflict = (composition[selection] && composition[selection]!=team)?composition[selection]:null;
    
      if(revvTeamConflict || teamSwapConflict)
        setEquipConflicts({revvTeamConflict: revvTeamConflict,teamSwapConflict})
      else
        equipItemWithTokenId(selection)
    }
  }

  const onModalConfirm = async (tokenId) => {
    if(equipConflicts.revvTeamConflict && equipConflicts.teamSwapConflict)
        setEquipConflicts({teamSwapConflict:equipConflicts.teamSwapConflict})
    else{
      setEquipConflicts({})
      equipItemWithTokenId(tokenId)
    }
  }


  const equipItemWithTokenId = async (tokenId) => {
    const result = await equipItem(season, team, tokenId)
      .catch(e => console.error(e))
        if(result)
          setComposition(result)
    setItemGalleryModalVisible(false)
  }
  
  let previewItem = selection?selection:equipped;
  if(!previewItem && !subCategory)previewItem=categoryMainItem;

  let backgroundImage,backgroundImageHalo,logoUrl

  if(previewItem && itemsData[previewItem]){
    backgroundImage = <img src={itemsData[previewItem].images.preview}></img>
    logoUrl = teamLogos[itemsData[previewItem].season]? teamLogos[itemsData[previewItem].season][itemsData[previewItem].teamId] : "";
    
    backgroundImageHalo = <img id="halo" src={getPreviewItemHaloUrl(itemsData[previewItem].type,itemsData[previewItem].rarity)}></img>
    
    if(!subCategory && category == "driver"){
      backgroundImage = <img src={itemsData[previewItem].images.driverPreview}></img>
      backgroundImageHalo = <img id="halo" src={getPreviewItemHaloUrl(itemsData[previewItem].type,itemsData[previewItem].rarity,true)}></img>
    }
  }else{
    const itemType = !subCategory || subCategory=="select"?category:subCategory;
    backgroundImage = <img src={getUnequippedImageUrlForItemType(itemType, season)}></img>
    
  }
    
  
  if(subCategory && subCategory!="select")logoUrl = null;

  let attributePane
  if(subCategory && selection) attributePane = <ItemAttributePane data={{selection:(selection?itemsData[selection]:null),equipped:(equipped?itemsData[equipped]:null)}}/>

  let buttons;
  if(subCategory)
    buttons = <>
    {/* {false && selection?<Button variant="revv" onClick = {sellItem} disabled={false}>{t("Sell")}</Button>:<></>} */}
    {selection?<Button variant="revv" onClick = {onEquipButton} disabled={false}>{selection==equipped?t("Unequip"):t("Equip")}</Button>:<></>}</>
  else
    buttons = <>{<Link to={`/${baseUrl}/${season}/${team}/${category}/select`}><Button variant="revv" disabled={false}>{t("Change")}</Button></Link>}</>

  let mobileButtons;
  if(subCategory)
    mobileButtons = <>
    {itemGalleryModalVisible?
    selection?<Button variant="revv" onClick = {onEquipButton} disabled={false}>{selection==equipped?t("Unequip"):t("Equip")}</Button>:<></>:
    <Button variant="revv" onClick = {onShowItemGalleryModal} disabled={false}>{equipped?t("Change"):t("Equip")}</Button>}</>
  else
    mobileButtons = <>{<Link to={`/${baseUrl}/${season}/${team}/${category}/select`}><Button variant="revv" disabled={false}>{t("Compose")}</Button></Link>}</>
  

  return <>
        <div className = "item-preview-pane">
        <div className="attributes">{attributePane}</div>
        <div className="image"><div className="composed-image">{backgroundImage}{backgroundImageHalo}</div></div>
        <div className="buttons" id="default">{buttons}</div>
        <div className="buttons" id="mobile">{mobileButtons}</div>
        {/* #region TEAM_LOGOS
        {logoUrl?<div className = "logo"><img src={logoUrl}></img></div>:<></>} */}
        </div>
        <EquipConflictModal data={{equipConflicts,hideConfirmModal,selection,onModalConfirm}}/>
      </>
}
function EquipConflictModal(props){
  
  const {t} = useTranslation();
  const {equipConflicts,hideConfirmModal,selection,onModalConfirm} = props.data
  let showing = false
  let message
  // console.log(equipConflicts)
  if(equipConflicts.revvTeamConflict){
    showing = true
      message = t("This is incompatible with your current *car*. Do you want to remove your *car*?")
      var replacement = t(capitalize(equipConflicts.revvTeamConflict))
      message = message.replace(new RegExp('\\*\[^\\*]*\\*','g'), replacement.toLowerCase());
  }else if(equipConflicts.teamSwapConflict){
    showing = true
    message = t("Attaching this will remove it from another Team")
  }
  
  return <Modal dialogClassName="equip-conflict-modal" show={showing == true} onHide={hideConfirmModal} centered>
  
  <Modal.Body>{message}</Modal.Body>
  <Modal.Footer>
    <Button variant="revv-secondary" onClick={hideConfirmModal}>
      {t("Cancel")}
    </Button>
    <Button variant="revv" onClick={()=>onModalConfirm(selection)}>
    {t("CONFIRM")}
    </Button>
  </Modal.Footer>
</Modal>
}
export {ItemPreviewPane};