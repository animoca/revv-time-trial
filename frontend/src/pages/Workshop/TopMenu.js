import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useLocation, useHistory } from 'react-router-dom';
import { Dropdown, Button } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getSubTypesInCategory, getRarityString } from './Helper';
import { TeamModal } from './TeamModal'

import mainFadeCommonUrl from '../../assets/img/workshop/main-bar-common.png'
import mainFadeRareUrl from '../../assets/img/workshop/main-bar-rare.png'
import mainFadeEpicUrl from '../../assets/img/workshop/main-bar-epic.png'
import mainFadeLegendaryUrl from '../../assets/img/workshop/main-bar-legendary.png'
import mainFadeApexUrl from '../../assets/img/workshop/main-bar-apex.png'

// import mainCarGenericUrl from '../../assets/img/workshop/main-bar-car-generic.png'
import mainDriverGenericUrl from '../../assets/img/workshop/main-bar-driver-generic.png'
import mainBarPatternUrl from "../../assets/img/workshop/main-bar-pattern.png"
import './styles/TopMenu.scss';

const iconUrls = {
    //#region NFT_IMAGES
    // car: require('../../assets/img/workshop/icons/icon-parts-car.png'),
    //#endregion NFT_IMAGES
    driver: require('../../assets/img/workshop/icons/icon-gear-driver.png'),
    powerunit: require('../../assets/img/workshop/icons/icon-parts-powerunit.png'),
    turbocharger: require('../../assets/img/workshop/icons/icon-parts-turbocharger.png'),
    frontwing: require('../../assets/img/workshop/icons/icon-parts-frontwing.png'),
    rearwing: require('../../assets/img/workshop/icons/icon-parts-rearwing.png'),
    energystore: require('../../assets/img/workshop/icons/icon-parts-energystore.png'),
    brakes: require('../../assets/img/workshop/icons/icon-parts-brakes.png'),
    transmission: require('../../assets/img/workshop/icons/icon-parts-transmission.png'),
    suspension: require('../../assets/img/workshop/icons/icon-parts-suspension.png'),
    gloves: require('../../assets/img/workshop/icons/icon-gear-gloves.png'),
    suit: require('../../assets/img/workshop/icons/icon-gear-suit.png'),
    helmet: require('../../assets/img/workshop/icons/icon-gear-helmet.png'),
    boots: require('../../assets/img/workshop/icons/icon-gear-boots.png')
}

const unequippedIconUrls = {
    car: require('../../assets/img/workshop/icons/icon-parts-car-invalid.png'),
    driver: require('../../assets/img/workshop/icons/icon-gear-driver-invalid.png'),
    powerunit: require('../../assets/img/workshop/icons/icon-parts-powerunit-invalid.png'),
    turbocharger: require('../../assets/img/workshop/icons/icon-parts-turbocharger-invalid.png'),
    frontwing: require('../../assets/img/workshop/icons/icon-parts-frontwing-invalid.png'),
    rearwing: require('../../assets/img/workshop/icons/icon-parts-rearwing-invalid.png'),
    energystore: require('../../assets/img/workshop/icons/icon-parts-energystore-invalid.png'),
    brakes: require('../../assets/img/workshop/icons/icon-parts-brakes-invalid.png'),
    transmission: require('../../assets/img/workshop/icons/icon-parts-transmission-invalid.png'),
    suspension: require('../../assets/img/workshop/icons/icon-parts-suspension-invalid.png'),
    gloves: require('../../assets/img/workshop/icons/icon-gear-gloves-invalid.png'),
    suit: require('../../assets/img/workshop/icons/icon-gear-suit-invalid.png'),
    helmet: require('../../assets/img/workshop/icons/icon-gear-helmet-invalid.png'),
    boots: require('../../assets/img/workshop/icons/icon-gear-boots-invalid.png')
}

function SubcategoryMenu(props) {
    const { category, season, team, subCategory } = useParams();
    const { itemsData, composition } = useContext(WorkshopContext)

    const items = [category, ...getSubTypesInCategory(category)]
    const baseUrl = useLocation().pathname.split('/')[1]

    const { id } = props.data

    const getEquippedItem = (type) => {
        return Object.values(itemsData).find((item) => {
            if (composition[item.tokenId] == team && item.type == type)
                return true;
            return false;
        })
    }


    return (
        <div className="subcategory-menu" id={id}>{items.map((item, index) => {

            const equipped = getEquippedItem(item)
            const selected = item == subCategory || (subCategory == "select" && item == category)
            const linkTo = item == "car" || item == "driver" ? "select" : item

            return <div key={linkTo} className="top-menu-item">
                <div className="top-menu-item-image" id={selected ? "selected" : ""}>
                    <Link to={`/${baseUrl}/${season}/${team}/${category}/${linkTo}`}>
                        {/* <img src={equipped ? iconUrls[item] : unequippedIconUrls[item]} /> */}
                        <img src={unequippedIconUrls[item]} />
                    </Link>
                </div>
                <div className="item-rarity-strip" id={equipped ? getRarityString(equipped.rarity) : ""}></div>
            </div>
        })
        }</div>
    )
}

function TopMenu(props) {
    const { t, i18n } = useTranslation()
    const { season, team, category, subCategory } = useParams();
    const history = useHistory();
    const { itemsData, composition, compNames } = useContext(WorkshopContext)
    const [showTeamModal, setShowTeamModal] = useState(false);

    const { carMainItem, driverMainItem } = props.data

    const items = [category, ...getSubTypesInCategory(category)]
    const baseUrl = useLocation().pathname.split('/')[1]

    const mainFadesUrls = {
        common: mainFadeCommonUrl,
        rare: mainFadeRareUrl,
        epic: mainFadeEpicUrl,
        legendary: mainFadeLegendaryUrl,
        apex: mainFadeApexUrl
    }

    let carRarity = "common", driverRarity = "common"
    if (carMainItem && itemsData[carMainItem])
        carRarity = getRarityString(itemsData[carMainItem].rarity)
    if (driverMainItem && itemsData[driverMainItem])
        driverRarity = getRarityString(itemsData[driverMainItem].rarity)

    // const carSectionStyle = {
    //     backgroundImage: `linear-gradient(to left, transparent,black 150px),url(${mainCarGenericUrl}),
    // url(${mainFadesUrls[carRarity]}),url(${mainBarPatternUrl})`
    // }
    const carSectionStyle = {
        backgroundImage: `linear-gradient(to left, transparent,black 150px),,
    url(${mainFadesUrls[carRarity]}),url(${mainBarPatternUrl})`
    }

    const driverSectionStyle = {
        backgroundImage: `linear-gradient(to left, transparent,black 150px),url(${mainDriverGenericUrl}),
    url(${mainFadesUrls[driverRarity]}),url(${mainBarPatternUrl})`
    }

    /*
    const isUpgradeAvailable = (tab) => {
        if(tab == category)return false;
        let [type,subTypes] = getTypeAndSubTypesFromTab(tab)

        return subTypes.some((subType) => {
            return Object.values(itemsData).some((item)=>{
                if(item.type == type && item.subType == subType)
                    return item.upgrade;
                return false;
              })
        })
    }

    const isFullyEquipped = (tab) => {
        return true;
        let [type,subTypes] = getTypeAndSubTypesFromTab(tab)

        return subTypes.every((subType) => {
                return Object.values(itemsData).some((item)=>{
                if(item.type == type && item.subType == subType)
                    if(composition[item.tokenId] == team)
                        return true;
                return false;
            })
        })
    }
    */

    const changeTeam = (teamIndex) => {
        history.push(`/${baseUrl}/${season}/${teamIndex}/car`)
    }

    const selectSection = (section) => {
        if (section == "driver")
            history.push(category == "driver" && !subCategory ? `/${baseUrl}/${season}/${team}/driver/select` : `/${baseUrl}/${season}/${team}/driver`)
        else if (section == "car")
            history.push(category == "car" && !subCategory ? `/${baseUrl}/${season}/${team}/car/select` : `/${baseUrl}/${season}/${team}/car`)
    }

    const getSectionId = (header) => {
        return category != header || (category == header && !subCategory) ? "closed" : "open";
    }

    const renderCarSection = () => {
        return <div className="section" id={getSectionId("car")} style={carSectionStyle}>
            <Button id={getSectionId("car")} onClick={() => selectSection("car")} variant="revv-composition-section" ><span className="btn-text">{t("Car")}</span>
                <span className="caret"><FontAwesomeIcon size="lg" icon={faCaretRight} /></span></Button>
            {category == "car" && subCategory ? <SubcategoryMenu data={{ id: "inline" }} /> : <></>}
        </div>
    }

    const renderDriverSection = () => {
        return <div className="section" id={getSectionId("driver")} style={driverSectionStyle}>
            <Button id={getSectionId("driver")} onClick={() => selectSection("driver")} variant="revv-composition-section" ><span className="btn-text">{t("Driver")}</span>
                <span className="caret"><FontAwesomeIcon size="lg" icon={faCaretRight} /></span></Button>
            {category == "driver" && subCategory ? <SubcategoryMenu data={{ id: "inline" }} /> : <></>}
        </div>
    }

    const renderMobileViewSubcategory = () => {
        return <div className="top-menu-subcategory"><SubcategoryMenu data={{ id: "mobile" }} /></div>
    }

    const getCompositionName = (id) => {
        return compNames && compNames[id] ? compNames[id] : "Team" + " " + Number(id)
    }

    return (<>
        <div className="top-menu">
            <span className="divider"></span>

            <Dropdown>
                <Dropdown.Toggle onClick={() => setShowTeamModal(true)} className="top-menu-dropdown-button"><span className="o-ellipsis btn-text">{getCompositionName(team)}</span><span id="team-caret" className="caret"><FontAwesomeIcon size="lg" icon={faCaretDown} /></span></Dropdown.Toggle>
            </Dropdown>

            {renderCarSection()}
            {renderDriverSection()}
        </div>
        {renderMobileViewSubcategory()}
        <TeamModal show={showTeamModal} 
            setShow={setShowTeamModal}
            selected={team} 
            changeTeam={changeTeam}
            season={season}
        />
    </>)
}


export { TopMenu };