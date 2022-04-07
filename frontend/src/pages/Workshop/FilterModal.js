
import React, {useState,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {  Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import {getSortAttributeString} from './Helper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faAngleRight,faAngleLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles/FilterModal.scss';

function FilterModal(props){
  
    const {t} = useTranslation();
    const {filterModalVisible,setFilterModalVisible,raritiesAvailable,applyModalFilters,category} = props.data
    const [view, setView] = useState(null)
  
    const [sortAttribute,setSortAttribute] = useState(0)
    const [sortOrder,setSortOrder] = useState(-1)
    const [rarityFilter,setRarityFilter] = useState("")
  
    useEffect(() => {
        setSortAttribute(props.data.sortAttribute)
        setSortOrder(props.data.sortOrder)
        setRarityFilter(props.data.rarityFilter)
      },[filterModalVisible])

    const changeSortAttribute = (value) =>{
      setSortAttribute(value)
      setView(null)
    }
  
    const changeSortOrder = (value) =>{
      setSortOrder(value)
      setView(null)
    }
    
    const changeRarityFilter = (value) =>{
      setRarityFilter(value)
      setView(null)
    }
    
    const renderHeader = () => {
      switch(view){
        case null:
            return <>{t("Filter")}</>
          case "attribute":
            return <Button variant="revv-transparent" onClick={()=>setView(null)}>
              <span className="caret"><FontAwesomeIcon size="sm" icon={faAngleLeft} /></span>{t("Attribute")}
            </Button>
          case "order":
              return <Button variant="revv-transparent" onClick={()=>setView(null)}>
              <span className="caret"><FontAwesomeIcon size="sm" icon={faAngleLeft} /></span>{t("Order")}</Button>
          case "rarity":
              return <Button variant="revv-transparent" onClick={()=>setView(null)}>
              <span className="caret"><FontAwesomeIcon size="sm" icon={faAngleLeft} /></span>{t("Rarity")}</Button>
      }
    }
    const renderView = () => {
      switch(view){
        case null:
          return <>
          <Button variant="revv-transparent" onClick={()=>setView("attribute")}>{t("Attribute")}
            <span className="value">{t(getSortAttributeString(category,sortAttribute))}
              <span className="caret"><FontAwesomeIcon size="sm" icon={faAngleRight} /></span>
            </span>
          </Button>
          <Button variant="revv-transparent" onClick={()=>setView("order")}>{t("Order")}
            <span className="value">{sortOrder == 1 ? t("Ascending") : t("Descending")}
              <span className="caret"><FontAwesomeIcon size="sm" icon={faAngleRight} /></span>
            </span>
          </Button>
          <Button variant="revv-transparent" onClick={()=>setView("rarity")}>{t("Rarity")}
            <span className="value">{rarityFilter != "" ? t(rarityFilter) : t("All Tiers")}
              <span className="caret"><FontAwesomeIcon size="sm" icon={faAngleRight} /></span>
            </span>
          </Button>
          </>
          
        case "attribute":
            return <>{[0, 1, 2, 3, 4].map(index => 
            <Button variant="revv-transparent" key={index} onClick={()=>changeSortAttribute(index)} >{t(getSortAttributeString(category,index))}
            {sortAttribute == index?<span className="caret"><FontAwesomeIcon size="sm" icon={faCheck} /></span>:<></>}
            </Button>)}</>
        case "order":
            return <>
            <Button variant="revv-transparent" onClick={()=>changeSortOrder(1)} >{t("Ascending")}
              {sortOrder == 1?<span className="caret"><FontAwesomeIcon size="sm" icon={faCheck} /></span>:<></>}
            </Button>
            <Button variant="revv-transparent" onClick={()=>changeSortOrder(-1)}>{t("Descending")}
              {sortOrder == -1?<span className="caret"><FontAwesomeIcon size="sm" icon={faCheck} /></span>:<></>}
            </Button>
            </>
        case "rarity":
            return <>
            <Button variant="revv-transparent" key={"All Tiers"} onClick={()=>changeRarityFilter("")}>{t("All Tiers")}
            {rarityFilter == ""?<span className="caret"><FontAwesomeIcon size="sm" icon={faCheck} /></span>:<></>}</Button>
            {raritiesAvailable.map(rarity => <Button variant="revv-transparent" key={rarity} onClick={()=>changeRarityFilter(rarity)}>{t(rarity)}
            {rarityFilter == rarity?<span className="caret"><FontAwesomeIcon size="sm" icon={faCheck} /></span>:<></>}
            </Button>)}
            </>
      }
    }
  
    const resetFilters = () => {
      setSortAttribute(0)
      setSortOrder(-1)
      setRarityFilter("")
    }
  
    const applyAndClose = () => {
      applyModalFilters({sortAttribute,sortOrder,rarityFilter})
      setView(null)
      setFilterModalVisible(false)
    }
  
    const close = () => {
      setView(null)
      setFilterModalVisible(false)
    }
  
    return <Modal dialogClassName="filter-modal" show={filterModalVisible} centered>
    <Modal.Header>
      <Modal.Title>{renderHeader()}</Modal.Title>
      <Button variant="revv-transparent" onClick={close}><FontAwesomeIcon size="lg" icon={faTimes} /></Button>
    </Modal.Header>
    <Modal.Body>
      <div className="button-list">{renderView()}</div>
    </Modal.Body>
    <Modal.Footer>
      {!view?<>
      <Button variant="revv-secondary" onClick={resetFilters}>{t("RESET")}</Button>
      <Button variant="revv" onClick={applyAndClose}>{t("Confirm")}</Button>
      </>:<></>}
    </Modal.Footer>
  </Modal>
  }

  export {FilterModal}