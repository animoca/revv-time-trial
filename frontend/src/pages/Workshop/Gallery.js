import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Modal, Button, Dropdown,Pagination, Nav, Tab } from 'react-bootstrap';
import { useParams, useHistory, useLocation} from 'react-router-dom';
import { AuthContext, WorkshopContext } from '../../components/Context';
import {useDebouncedCallback} from '../../components/helper';
import {TopMenu} from './TopMenu'
import {BottomPane} from './BottomPane'
import {ItemTile} from './ItemTile'
import {Summary} from './Summary'
import {TeamPane} from './TeamPane'
import { ItemPreviewPane } from './ItemPreviewPane';
import { FilterModal } from './FilterModal';
import { BottomAttributePane } from './BottomAttributePane';
import { SecondaryNavigationTabs } from '../../components';
import {itemTypeToLabel,getUnequippedImageUrlForItemType,getSortAttributeString,capitalize} from './Helper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTimes, faFilter} from '@fortawesome/free-solid-svg-icons';
import './styles/Workshop.scss';

const constants = require("../../services/nftConstants.json") 

function Gallery(props) {
  const {t, i18n} = useTranslation();

  const {user} = useContext(AuthContext)
  const {season, team, category, subCategory} = useParams();
  const [selection, setSelection] = useState(null);
  const [equipped, setEquipped] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(null);
  const [itemTypeFilter,setItemTypeFilter] = useState({})
  const [location, setLocation] = useState()
  const [sortOrder, setSortOrder] = useState(-1)
  const [rarityFilter, setRarityFilter] = useState("")
  const [raritiesAvailable, setRaritiesAvailable] = useState([])
  const [sortAttribute, setSortAttribute] = useState(0)
  const [pageNumber, setPageNumber] = useState(0)
  const [carMainItem, setCarMainItem] = useState(null)
  const [driverMainItem, setDriverMainItem] = useState(null)
  const [itemGalleryModalVisible,setItemGalleryModalVisible] = useState(false)
  const {itemsData,composition,setComposition} = useContext(WorkshopContext)
  
  const history = useHistory()
  const currentLocation = useLocation();

  useEffect(() => {
    setLocation(currentLocation.pathname)

    return () => history.listen((location, action) => {setLocation(location.pathname)})
  }, [user, season]);
  
  useEffect(() => {
    setItemGalleryModalVisible(false)
  },[location])

  useEffect(() => {
    if(!itemGalleryModalVisible)
      setSelection(null)
    else if(equipped)
      setSelection(equipped);//todo:scroll to selection
  },[itemGalleryModalVisible])

  useEffect(() => {
    if(!itemsData || itemsData.length==0)return;
    const itemFilter = subCategory=="select"?category:subCategory
    
    setItemTypeFilter(itemFilter)
    if(subCategory){
      let equippedItem = getEquippedItem(team,itemFilter)
      setEquipped(equippedItem?equippedItem.tokenId:null)
      setSelection(equippedItem?equippedItem.tokenId:null)
    }else{
      setEquipped(null)
      setSelection(null)
    }
    setPageNumber(0)
  },[location,itemsData,subCategory])

  useEffect(() => {
    if(!itemsData || itemsData.length==0)return;
    if(subCategory){
      let equippedItem = getEquippedItem(team,itemTypeFilter) 
      if(equippedItem)
        setSelection(equippedItem.tokenId)
      setEquipped(equippedItem?equippedItem.tokenId:null)
    }else{
      setEquipped(null)
      setSelection(null)
    }
    
  },[composition])

  useEffect(() => {
    // console.log(team, composition, season, Object.keys(itemsData).length)
    const carItem = getEquippedItem(team,"car")
    setCarMainItem(carItem?carItem.tokenId:null)

    const driverItem = getEquippedItem(team,"driver")
    setDriverMainItem(driverItem?driverItem.tokenId:null)

  },[team,composition,season,itemsData])
  
  useEffect(() => {
    const page = getPageNumberForItem(equipped)
    if(equipped)
      setPageNumber(page!=-1?page:0)
  },[equipped])
  
  useEffect(() => {
    setSortAttribute(0)
  },[category])

  useEffect(() => {
    const selectionPage = getPageNumberForItem(selection)
    const equippedPage = getPageNumberForItem(equipped)

    if(selection){
      setPageNumber(selectionPage!=-1?selectionPage:0)
      if(selectionPage==-1)
        setSelection(null)
      
    }else if(equipped){
      setPageNumber(equippedPage!=-1?equippedPage:0)
      if(equippedPage==-1)
        setSelection(null)
    }else
      setPageNumber(0)
    
  },[rarityFilter,sortAttribute,sortOrder])

  useEffect(() => {
    const items = getGalleryItems()

    const raritiesOnDisplay = [...new Set(items.map((item)=>{
      return constants.Rarities[item.rarity]}))]
    
    const allRarities = Array.from(new Set(Object.values(constants.Rarities)))

    const raritiesSorted = allRarities.filter((rarity)=>{
    return raritiesOnDisplay.indexOf(rarity)!=-1
    })

    const raritiesSortedCapitalized = raritiesSorted.map(rarity=>{
      return rarity.charAt(0).toUpperCase() + rarity.slice(1)
    })
    
    setRaritiesAvailable(raritiesSortedCapitalized)
    
    if(raritiesSorted.indexOf(rarityFilter)==-1)
      setRarityFilter("")
  },[itemTypeFilter])

  useEffect(() => {
    if(selection && Object.keys(itemsData).findIndex((entry)=>entry==selection)!=-1){
      const equippedItem = getEquippedItem(team,itemsData[selection].type)
      setEquipped(equippedItem?equippedItem.tokenId:null)
    }
  },[selection])
  
  const getEquippedItem = (team, type) => {
    return Object.values(itemsData).find((item)=>{
      if(team == composition[item.tokenId] && item.type == type)
      return true;
      return false;
    })
  }

  const hideItemGalleryModal = () => {
    setItemGalleryModalVisible(false)
  }
  

  // const resetTeamComposition = async () => {
  //   const result = await resetTeam(team)
  //   if(result)
  //     setComposition(result)
  // }

  const onSelect = (selected) => {
    setSelection(selected);
  }

  const getPageNumberForItem = (item) => {
    const items = getGalleryItemsSortedAndFiltered() 
    const totalItems = items.length
    const pages =  Math.ceil(totalItems/constants.ItemsPerGalleryPage)
    const itemIndexInView = items.findIndex(entry => entry.tokenId==item)
    if(itemIndexInView==-1)return -1
    return Math.max(0,Math.min(pages,Math.floor(itemIndexInView/constants.ItemsPerGalleryPage)));
  }

  const getPaginationItems = () => {
    const totalItems = getGalleryItemsSortedAndFiltered().length
    const pages =  Math.ceil(totalItems/constants.ItemsPerGalleryPage)
    let min=0,max=pages;
    const bracketSize = 5
    if(pages>7){
      min = Math.max(0,pageNumber-Math.floor(bracketSize/2))
      max = min+bracketSize
      if(max>pages)
        min-=max-pages
      max = Math.min(max,pages)
    }

    const arrows = pages>5
    if(pages == 1)return
    const items = [];
    if(arrows)
        items.push( <Pagination.First key="first" onClick={()=>setPageNumber(0)}/>,<Pagination.Prev key="prev" onClick={()=>setPageNumber(pageNumber>0?pageNumber-1:0)}/>)
    if(min!=0)
      items.push(<Pagination.Item key={"ellipsis-start"} onClick={()=>setPageNumber(min-1)}>{"..."}</Pagination.Item>)
    for (let i = min; i < max; i++) {
      items.push(
        <Pagination.Item key={i} onClick={()=>setPageNumber(i)} active={pageNumber==i}>
          {(i+1)}
        </Pagination.Item>,
      );
    }
    if(max!=pages)
      items.push(<Pagination.Item key={"ellipsis-end"} onClick={()=>setPageNumber(max)}>{"..."}</Pagination.Item>)
    if(arrows)
      items.push( <Pagination.Next key="next" onClick={()=>setPageNumber(pageNumber!=pages-1?pageNumber+1:pageNumber)}/>,<Pagination.Last key="last" onClick={()=>setPageNumber(pages-1)}/>)

    return items
  }

  const getGalleryItems = () => {
    return Object.values(itemsData).filter((item) => {
      return itemTypeFilter == item.type
    });
  }

  const applyModalFilters = (data) =>
  {
    setSortAttribute(data.sortAttribute)
    setSortOrder(data.sortOrder)
    setRarityFilter(data.rarityFilter)
  }

  const getGalleryItemsSorted = () => {
    let items = getGalleryItems()
    if(sortAttribute){
      items.sort((item1,item2) => {
        const attrName = constants.RacingAttributeFields[category][sortAttribute-1]
        return sortOrder*(item1.attributes[attrName]-item2.attributes[attrName])
      })
    }else
      items.sort((item1,item2) => {
      return -sortOrder*(item1.rarity-item2.rarity)
      })
    return items;
    
  }

  const getGalleryItemsSortedAndFiltered = () => {
    let items = getGalleryItemsSorted()
    if(rarityFilter!="")
        items = items.filter((item) => {
        return constants.Rarities[item.rarity]==rarityFilter.toLowerCase()
        })
    return items
  }

  const isFilterActive = () => {
    return rarityFilter!="" || sortAttribute!=0 || sortOrder != -1
  }
  
  //<Button className="mobile-filter-button"><FontAwesomeIcon size="sm" icon={faPlus} />{t("Add More")}</Button>
  const renderItemGalleryFilterButton = () => {
    return <>
      <Button className="filter-button" id={isFilterActive()?"filter-active":""} onClick={()=>setFilterModalVisible(true)}>
      <span className="filter-icon"><FontAwesomeIcon size="sm" icon={faFilter} /></span>
        {t("Filter")}
        {isFilterActive()?<span className="filter-active-icon">●</span>:<></>}
      </Button>
    </>
  }
  const renderItemGalleryFilters = () => {
    return <>
    
      <Dropdown onSelect={(ev) => setSortAttribute(Number(ev))}>
        <Dropdown.Toggle className="filter-dropdown-button">{t(getSortAttributeString(category,sortAttribute))}</Dropdown.Toggle>
        <Dropdown.Menu className="filter-menu-dropdown">
          {[0, 1, 2, 3, 4].map(index => <Dropdown.Item variant="revv-composition" key={index} eventKey={index} active={sortAttribute == index}>{t(getSortAttributeString(category,index))}</Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown onSelect={(ev) => setSortOrder(Number(ev))}>
        <Dropdown.Toggle className="filter-dropdown-button">{sortOrder == 1 ? t("Ascending") : t("Descending")}</Dropdown.Toggle>
        <Dropdown.Menu className="filter-menu-dropdown">
          <Dropdown.Item variant="revv-composition" eventKey={1} active={sortOrder == 1}>{t("Ascending")}</Dropdown.Item>
          <Dropdown.Item variant="revv-composition" eventKey={-1} active={sortOrder == -1}>{t("Descending")}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown onSelect={(ev) => setRarityFilter(ev)}>
        <Dropdown.Toggle className="filter-dropdown-button">{rarityFilter != "" ? t(rarityFilter) : t("All Tiers")}</Dropdown.Toggle>
        <Dropdown.Menu className="filter-menu-dropdown">
          <Dropdown.Item variant="revv-composition" key={"All Tiers"} eventKey={""} active={rarityFilter == ""}>{t("All Tiers")}</Dropdown.Item>
          {raritiesAvailable.map(rarity => <Dropdown.Item key={rarity} eventKey={rarity} active={rarityFilter == rarity}>{t(rarity)}</Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown>
    </>
  }

  const renderItemTiles = () => {
    let items = getGalleryItemsSortedAndFiltered()
    let revvTeamLockCar,revvTeamLockDriver
    
    if(carMainItem)/*if(itemsData[carMainItem].teamId)*/revvTeamLockCar = itemsData[carMainItem].teamId
    if(driverMainItem)/*if(itemsData[driverMainItem].teamId)*/revvTeamLockDriver = itemsData[driverMainItem].teamId
   
    return items.map((item,index) => {
      return <ItemTile key={index} data={{
        item:item.tokenId,
        selection,onSelect,revvTeamLockCar: revvTeamLockCar,revvTeamLockDriver: revvTeamLockDriver}}/>
    })//.slice(pageNumber*constants.ItemsPerGalleryPage,(pageNumber+1)*constants.ItemsPerGalleryPage)
  }
  
  const renderItemGallery = () => {
    return (
    <div className = "item-gallery-container">
      <div className="item-gallery" style={{backgroundImage:`url(${getUnequippedImageUrlForItemType(!subCategory || subCategory=="select"?category:subCategory, season)})`}}>
        <div className="count"><div className="header">{t("Items")}</div>
        {isFilterActive() && getGalleryItemsSortedAndFiltered().length!=getGalleryItems().length?getGalleryItemsSortedAndFiltered().length+"/"+getGalleryItems().length:getGalleryItems().length}</div>
        <div className="top">
          <div className="name">{subCategory == "select" ? t(capitalize(category)) : t(itemTypeToLabel(subCategory))}</div>
          <div className="filters">{renderItemGalleryFilterButton()}</div>
        </div>
        <div className="contents">
          {renderItemTiles()}
        </div>
      </div>
    </div>
    )
  }
  //add more tile <ItemTileAddMore data={{ subType: subCategory == "select" ? category : subCategory }} key={999} />
  //pagination buttons <div className="pagination"><Pagination size="sm" className="pagination-button">{getPaginationItems()}</Pagination></div>
  const renderItemGalleryModal = () => {
    if(itemGalleryModalVisible)
    return (
      <div className="item-gallery-modal-container">
      <div className="close-button"><Button variant="revv-transparent" onClick={()=>hideItemGalleryModal()} disabled={false}><FontAwesomeIcon size="lg" icon={faTimes} /> {t("Close")}</Button></div>
      <div className="item-gallery">
        <div className="count"><div className="header">{t("Items")}</div>     
        {isFilterActive() && getGalleryItemsSortedAndFiltered().length!=getGalleryItems().length?getGalleryItemsSortedAndFiltered().length+"/"+getGalleryItems().length:getGalleryItems().length}</div>
        <div className="top">
          <div className="name">{subCategory == "select" ? category : itemTypeToLabel(subCategory)}</div>
          <div className="filters">{renderItemGalleryFilterButton()}</div>
        </div>
        <div className="content-wrapper">
        <div className="bottom-fade"></div>
        <div className="contents">
          {renderItemTiles()}
        </div></div>
      </div>
      
      </div>
    )
  }

  const debouncedChangeSeason = useCallback(
    useDebouncedCallback(_season => changeSeason(_season, season), 500),
    [season]
  )

  const changeSeason = (_season, currSeason) => {
    if(_season === parseInt(currSeason)) {
      return;
    }

    setComposition({})
    history.push(`/workshop/${_season}/${team}/car`)
    setSelection(null);
    setEquipped(null);
    setCarMainItem(null)
    setDriverMainItem(null)
  }

  const handleChangeSeason = _season => {
    debouncedChangeSeason(_season)
  }

  return (
      <div className={`gallery-bg s${season}`} id={subCategory?"parts":"summary"}>
        <SecondaryNavigationTabs innerTitlesWrapperClasses="container" contentWrapperClasses="tab-content" defaultTabKey={season}>
          <SecondaryNavigationTabs.Tab tabKey="2020" overrideTabClickedAction={() => handleChangeSeason(2020)}>
            <SecondaryNavigationTabs.Tab.Title>
              2020
            </SecondaryNavigationTabs.Tab.Title>
          </SecondaryNavigationTabs.Tab>
          <SecondaryNavigationTabs.Tab tabKey="2019" overrideTabClickedAction={() => handleChangeSeason(2019)}>
            <SecondaryNavigationTabs.Tab.Title>
              2019
            </SecondaryNavigationTabs.Tab.Title>
          </SecondaryNavigationTabs.Tab>
        </SecondaryNavigationTabs>

        <Container className="gallery" id="workshop">
          <TopMenu data={{carMainItem, driverMainItem}}/>
          <div className="gallery-row">
            {!subCategory ? <Summary /> : <></>}
            <div className="center-pane">
              <ItemPreviewPane data={{ selection, equipped, categoryMainItem:category=="car"?carMainItem:driverMainItem, setItemGalleryModalVisible, itemGalleryModalVisible }} />
                {subCategory?<BottomAttributePane data={{selection, equipped}}/>:<></>}
                <BottomPane data={{ selection, equipped, categoryMainItem:category=="car"?carMainItem:driverMainItem }} />
              </div>
              {subCategory ? renderItemGallery() : <TeamPane data={{ carMainItem,driverMainItem }} />}
            </div>
            {renderItemGalleryModal()}
          </Container>
        <FilterModal data={{filterModalVisible,setFilterModalVisible,sortAttribute,sortOrder,rarityFilter,raritiesAvailable,applyModalFilters,category}}/>
      </div>
  )

}

export {Gallery};