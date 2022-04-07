import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom';
import { Container, Row, Col, Button, Dropdown, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faFilter } from '@fortawesome/free-solid-svg-icons';
import { AuthContext, TimeTrialContext, WorkshopContext } from '../../components/Context';
import { getUnequippedImageUrlForItemType } from '../Workshop/Helper';
import { TrackSummary } from './Track';
import { ItemPane, TyreItemPane } from './ItemPane';
import { TyreItemTile } from '../Workshop/ItemTile';
import { ItemAttributePane } from '../Workshop/ItemAttributePane';
import { FilterModal } from '../Workshop/FilterModal';
import { getTriesLeft } from '../../services/timeTrialService';
import { customConfirm } from '../../components/helper/useConfirm';
import { getComposition, getTier } from '../../services/timeTrialService';
import { getFullMetaDataFromTokenId } from '../../services/nftData';
import { LeaveModal, RevvStakeLeagueModal, SuccessModal } from './Modals';
import { SecondaryNavigationTabs, ShowTries } from '../../components';
import {toWei, fromWei} from 'web3-utils';
import './scss/Loadout.scss';
import {TeamModal} from '../Workshop/TeamModal';
import { TabbedCurrentPool } from './TabbedCurrentPool';
import { getFullMetadata } from '@animoca/f1dt-core_metadata/src/utils';
import revIco from '../../assets/images/icon-revv.svg';

import unequippedTyreImageUrl from '../../assets/img/timetrial/unequippedTyre.png';
import {getRarityString,getRarityStringCapitalized,getStatMaxForItemType,itemTypeToLabel} from '../Workshop/Helper';
import { Spinner } from 'react-bootstrap';
import {StatProgressBar} from '../Workshop/StatProgressBar'

const constants = require("../../services/nftConstants.json");

function Loadout(props) {
  const { t, i18n } = useTranslation();
  const { season } = useParams();
  const location = useLocation();

  const [team, setTeam] = useState(() => {
    return location.state && location.state.team ? parseInt(location.state.team) : 1
  })
  const [tyres, setTyres] = useState(null)
  const [tyresData, setTyresData] = useState(1)
  const [selectingTyres, setSelectingTyres] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const {compNames, itemsData} = useContext(WorkshopContext);
  const {user} = useContext(AuthContext)
  const { tries, setTries, track, weather, setCompId, setCompCar, setCompDriver, compCar, compDriver, setCompTyre, compStats, setCompStats, getTriesPrice, getPurchaseId, getPurchaseName } = useContext(TimeTrialContext)
  //list of owned tyres
  const [composition, setComposition] = useState(null)
  const history = useHistory()
  const [tier, setTier] = useState('-')
  const triesLeftText = t("Tries left");

  const showTyreSelectionScreen = () => {
    setSelectingTyres(true)
  }

  const hideTyreSelectionScreen = () => {
    setSelectingTyres(false)
  }

  const sumAttr = (attr) => {
    if(attr && Object.keys(attr).length) {
      return Object.keys(attr).reduce((acc, curr) => {
        return acc + attr[curr];
      }, 0)
    }
    return 0;
  }

  const calculateTotalStats = (composition, tyre) => {
    let items = []
    items.push(composition.car)
    items.push(composition.driver)

    if(tyre) {
      items.push(tyre)
    }

    // if(composition.parts && composition.parts.length) {
    //   items.push(...composition.parts)
    // }

    // if(composition.gear && composition.gear.length) {
    //   items.push(...composition.gear)
    // }

    return Object.keys(items).reduce((acc, curr) => {
      return acc + sumAttr(items[curr].attributes)      
    }, 0)
  }

  useEffect(() => {
    (async () => {
      const compositionData = await getComposition(team, season)
        .catch(err => {
          console.error("Could not get composition!")
        });

      setComposition(compositionData)
      setCompId(team)
      if(compositionData) {
        setCompCar(compositionData.car.tokenId)
        setCompDriver(compositionData.driver.tokenId)
      } else {
        setCompCar(null)
        setCompDriver(null)
      }
    })()
  }, [team, season]);

  useEffect(() => {
    if(tyres) {
      setTyresData(getFullMetaDataFromTokenId(tyres))
      setCompTyre(tyres)
    } else {
      setTyresData(null)
    }
  }, [tyres, season])

  useEffect(() => {
    if(composition) {
      setCompStats(calculateTotalStats(composition, tyresData))
    }
  }, [composition, tyresData, season])

  useEffect(() => {
    const fetchData = async () => {
      let res = await getTier(team, tyres, season)
      if(res) {
        setTier(res.tier)
      } else {
        setTier('-')
      }
    }

    fetchData()
  }, [composition, tyres, season])

  const editTeam = (teamId) => {
    history.push(`/workshop/${season}/${teamId}/car`)
  }

  const handleStart = () => {
    // check for valid team comp
    if(composition && composition.car && composition.driver && tyres) {
      history.push(`/timetrial/${season}/race`, {})
    } else {
      console.error('You do not have a valid team!')
    }
  }

  const changeTeam = (id) => {
    setTeam(id)
  }

  const getCompositionName = (id) => {
    return compNames && compNames[id] ? compNames[id] : "Team" + " " + Number(id)
  }

  const tabClickedAction = (season) => {
    setTyres(null);
    setTyresData(null);
    setSelectingTyres(false);
    
    history.push(`/timetrial/${season}/loadout`);
  }

  return <div id="timetrial" className={`page-wrapper-bg s${season} loadout`}>
    <SecondaryNavigationTabs className="tabbed-current-pool" innerTitlesWrapperClasses="container" contentWrapperClasses="tab-content" defaultTabKey={season}>
      <SecondaryNavigationTabs.Tab tabKey="2020" overrideTabClickedAction={() => tabClickedAction(2020)}>
        <SecondaryNavigationTabs.Tab.Title>
          2020
        </SecondaryNavigationTabs.Tab.Title>
      </SecondaryNavigationTabs.Tab>
      <SecondaryNavigationTabs.Tab tabKey="2019" overrideTabClickedAction={() => tabClickedAction(2019)}>
        <SecondaryNavigationTabs.Tab.Title>
          2019
        </SecondaryNavigationTabs.Tab.Title>
      </SecondaryNavigationTabs.Tab>
    </SecondaryNavigationTabs>

    <div className="loadout-overview">
      <TrackSummary data={{ track, weather }} />
      <div className="loadout">
      {!selectingTyres ? <>
        <div className="loadout-header">
          <Dropdown>
            <Dropdown.Toggle className="team-select-dropdown-button" onClick={() => setShowTeamModal(true)}><span className="cn">{getCompositionName(team)}</span><span id="team-caret"><FontAwesomeIcon size="lg" icon={faCaretDown} /></span></Dropdown.Toggle>
          </Dropdown>
          <div className="d-right">
            <div className="stats"><h4>Total Stats: {compStats}, Tier: {tier}</h4></div>
            <Button variant="outline-revv" onClick={() => setShowLeaveModal(true)}>{t("Edit Team")}</Button>
          </div>
        </div>
        <Row className="loadout-team">
          <Col lg={4}><ItemPane data={{ type: "car", composition }} /></Col>
          <Col lg={4}><ItemPane data={{ type: "driver", composition }} /></Col>
          <Col lg={4}><TyreItemPane data={{ tokenId: tyres, tyresData, showTyreSelectionScreen }} /></Col>
        </Row>

        <div className="loadout-footer mb-sticky-bottom">
          {<>
              <ShowTries tries={tries} data={{setTries, updateTries:getTriesLeft, triesLeftText}} />
              <Button variant="revv" disabled = {tries == 0 || !tyres || !compCar || !compDriver} onClick={handleStart}>{t("Play")}</Button>
            </>
          }
        </div>

      </> : <TyreSelection data={{ tyres, setTyres, hideTyreSelectionScreen, itemsData, season }} />}
      </div>
      <LeaveModal show={showLeaveModal} setShow={setShowLeaveModal} redirect={editTeam.bind(null, team)} />
      <TeamModal show={showTeamModal} 
        setShow={setShowTeamModal}
        selected={team} 
        changeTeam={changeTeam}
      />
    </div>
  </div>
}

function TyreSelection(props) {
  const { t, i18n } = useTranslation();
  const { setTyres, hideTyreSelectionScreen, tyres, itemsData, season } = props.data
  const [selection, setSelection] = useState(tyres);
  const [equipped, setEquipped] = useState(tyres);
  const [selectionMetadata, setSelectionMetadata] = useState();
  const [equippedMetadata, setEquippedMetadata] = useState();
  const [filterModalVisible, setFilterModalVisible] = useState(null);
  const [itemGalleryModalVisible, setItemGalleryModalVisible] = useState(false)
  const [rarityFilter, setRarityFilter] = useState("")
  const [raritiesAvailable, setRaritiesAvailable] = useState([])
  const [sortOrder, setSortOrder] = useState(-1)
  const [sortAttribute, setSortAttribute] = useState(0)

  useEffect(() => {
    if (!equipped) return;
    try {
      const response = getFullMetadata(equipped);
      setEquippedMetadata(response)
    } catch(e) {
      console.error("Could not get item metadata! ", equipped)
    }
  }, [equipped]);

  useEffect(() => {
    if (!selection) return;
    try {
      const response = getFullMetadata(selection);
      setSelectionMetadata(response)
    } catch(e) {
      console.error("Could not get item metadata! ", selection)
    }
  }, [selection]);

  useEffect(() => {
    const items = getGalleryItems()

    const raritiesOnDisplay = [...new Set(items.map((item) => {
      return constants.Rarities[item.rarity]
    }))]

    const allRarities = Array.from(new Set(Object.values(constants.Rarities)))

    const raritiesSorted = allRarities.filter((rarity) => {
      return raritiesOnDisplay.indexOf(rarity) != -1
    })

    const raritiesSortedCapitalized = raritiesSorted.map(rarity => {
      return rarity.charAt(0).toUpperCase() + rarity.slice(1)
    })

    setRaritiesAvailable(raritiesSortedCapitalized)

    if (raritiesSorted.indexOf(rarityFilter) == -1)
      setRarityFilter("")
  }, [itemsData])


  const getGalleryItems = () => {
    return Object.values(itemsData).filter((item) => {
      return item.type == "tyres"
    });
  }

  const applyModalFilters = (data) => {
    setSortAttribute(data.sortAttribute)
    setSortOrder(data.sortOrder)
    setRarityFilter(data.rarityFilter)
  }

  const getTyresSorted = () => {
    let items = getGalleryItems()
    if (sortAttribute) {
      items.sort((item1, item2) => {
        const attrName = constants.RacingAttributeFields["tyres"][sortAttribute - 1]
        return sortOrder * (item1.attributes[attrName] - item2.attributes[attrName])
      })
    } else
      items.sort((item1, item2) => {
        return -sortOrder * (item1.rarity - item2.rarity)
      })
    return items;

  }

  useEffect(() => {
    setTyres(equipped)
  }, [equipped])

  const getTyresSortedAndFiltered = () => {
    let items = getTyresSorted()
    if (rarityFilter != "")
      items = items.filter((item) => {
        return constants.Rarities[item.rarity] == rarityFilter.toLowerCase()
      })
    return items
  }

  const onEquipButton = () => {
    if (equipped == selection) {
      setEquipped(null)
    } else if (selection) {
      setEquipped(selection)
    } else {

    }

    setTimeout(hideTyreSelectionScreen, 0);
  }

  const onSelect = (selected) => {
    setSelection(selected);
  }

  const renderTyreItemTiles = () => {
    let items = getTyresSortedAndFiltered()

    return items.map((item, index) => {
      return <TyreItemTile key={index} data={{
        item, selection, equipped, onSelect
      }} />
    })//.slice(pageNumber*constants.ItemsPerGalleryPage,(pageNumber+1)*constants.ItemsPerGalleryPage)
  }

  const isFilterActive = () => {
    return rarityFilter != "" || sortAttribute != 0 || sortOrder != -1
  }

  const renderTyreFilterButton = () => {
    return <>
      <Button className="filter-button" id={isFilterActive() ? "filter-active" : ""} onClick={() => setFilterModalVisible(true)}>
        <span className="filter-icon"><FontAwesomeIcon size="sm" icon={faFilter} /></span>
        {t("Filter")}
        {isFilterActive() ? <span className="filter-active-icon">●</span> : <></>}
      </Button>
    </>
  }

  const renderTyrePreviewImage = () => {
    let imageUrl
    if (selection && itemsData)
      imageUrl = selectionMetadata ? selectionMetadata.image : null;
    else if (equipped && itemsData)
      imageUrl = equippedMetadata ? equippedMetadata.image : null;
    else
      imageUrl = unequippedTyreImageUrl
    return <>
      <img src={imageUrl}></img>
    </>
  }

  const renderTyreItemGallery = () => {
    return (
      <div className="item-gallery-container">
        <div className="item-gallery" style={{ backgroundImage: `url(${getUnequippedImageUrlForItemType("tyres", season)})` }}>
          <div className="count"><div className="header">{t("Items")}</div>
            {isFilterActive() && getTyresSortedAndFiltered().length != getGalleryItems().length ? getTyresSortedAndFiltered().length + "/" + getGalleryItems().length : getGalleryItems().length}</div>
          <div className="top">
            <div className="name">{t("Tyres")}</div>
            <div className="filters">{renderTyreFilterButton()}</div>
          </div>
          <div className="contents">
            {renderTyreItemTiles()}
          </div>
        </div>
      </div>
    )
  }

  return <><div className="loadout-tyre-select">
    <div className="tyre-preview-pane">
      <div className="top">
        <div className="back-button">
          <Button variant="revv-secondary" onClick={hideTyreSelectionScreen}>{t("Back to Team")}</Button>
          {selection ? <Button variant="revv" onClick={onEquipButton}>{equipped == selection ? t("Unequip") : t("Equip")}</Button> : <></>}
        </div>
      </div>
      <div className="preview">
        <div className="tyre-attribute-pane">{selection && itemsData ? <ItemAttributePane data={{ selection: itemsData[selection], equipped: itemsData[equipped] }} /> : <></>}</div>
        {/* #region NFT_IMAGES
        <div className="tyre-preview-image">{renderTyrePreviewImage()}</div> */}
      </div>
    </div>
    <div className="tyre-item-gallery">{renderTyreItemGallery()}</div>
  </div>
  <MobileAttrPane data={{selection, equipped, itemsData}}/>
  <FilterModal data={{ filterModalVisible, setFilterModalVisible, sortAttribute, sortOrder, rarityFilter, raritiesAvailable, applyModalFilters, category: "tyres" }} />
  </>
}

function MobileAttrPane(props) {
  const {t, i18n} = useTranslation()
  const {selection,equipped,itemsData} = props.data;
  const availableItem = selection?selection:equipped;
  const category = "tyres"
  const [itemMetadata, setItemMetadata] = useState(null);

  useEffect( () => {
    if(!availableItem){
      setItemMetadata({name:category})
      return
    }

    try {
      const response = getFullMetadata(availableItem)
      setItemMetadata(response)
    } catch(e) {
      console.error("Could not get item metadata! ", availableItem)
    }
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

  return <div className = "bottom-attribute-pane-tyre">{attributes?<>
    {availableItem ? <div className="details"><div className="label">
    {itemMetadata?itemMetadata.name:<Spinner animation="border" variant="light" size="sm" />}</div>
    {t("Season")}<span className="season">{itemsData[availableItem].season}</span>
    <span className="rarity" id={getRarityString(itemsData[availableItem].rarity)}>{t(getRarityStringCapitalized(itemsData[availableItem].rarity))}</span>
    </div>:<></>}
    
    <div className="stat-bars">
    <StatProgressBar data={{name:attributes[0].name,value:attributes[0].value,newValue:attributes[0].newValue,max:attributes[0].max,inlineDelta:true}}/>
    <StatProgressBar data={{name:attributes[1].name,value:attributes[1].value,newValue:attributes[1].newValue,max:attributes[1].max,inlineDelta:true}}/>
    <StatProgressBar data={{name:attributes[2].name,value:attributes[2].value,newValue:attributes[2].newValue,max:attributes[2].max,inlineDelta:true}}/>
    </div>
    </>:<></>}</div>
}
export { Loadout }