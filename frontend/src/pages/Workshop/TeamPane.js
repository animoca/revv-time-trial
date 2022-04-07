import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {useHistory, useParams, useLocation} from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheckCircle,faTimesCircle, faAngleDoubleRight} from '@fortawesome/free-solid-svg-icons';
import {getUnequippedImageUrlForItemType} from './Helper'
import './styles/TeamPane.scss';

function TeamPane(props) {
  const {t, i18n} = useTranslation();
  const {season, team} = useParams();
  const {carMainItem,driverMainItem} = props.data;
  const {itemsData,composition} = useContext(WorkshopContext)
  const [totalScore, setTotalScore] = useState(0);
  const history = useHistory();
  const baseUrl = useLocation().pathname.split('/')[1]

  const goToTimeTrial = () => {
    history.push(`/timetrial/${season}`, {team});
  }

  const goToDriver = () => {
    history.push(`/${baseUrl}/${season}/${team}/driver/select`);
  }
  const goToCar = () => {
    history.push(`/${baseUrl}/${season}/${team}/car/select`);
  }
  
  useEffect(() => {
    if(Object.keys(itemsData).length) {
      let score = 0;
      Object.keys(composition).forEach((item)=>{
        if(team == composition[item] && itemsData[item]){
          Object.keys(itemsData[item].attributes).forEach(attr=>{
            if(attr!="luck")
            score += itemsData[item].attributes[attr]
          })
        }
      })
      setTotalScore(score)
    }
  }, [composition, itemsData, team])

  const ready = carMainItem && driverMainItem;
  let readyText = "Race Ready";
  if(!ready){
    if(!carMainItem)readyText = "Incomplete Composition. Car Required.";
    else if(!driverMainItem)readyText = "Incomplete Composition. Driver Required."
    else readyText = "";
  }
  
  
    return <Col id="team-pane">
      <div className = "team-pane">
        <div className = "top">{t("Team Total Score")}
        <div className = "score">{totalScore}</div>
        </div>
        <div className = "contents">
        <div className="items">
          <span className="item-tile" onClick={goToCar}><img src={carMainItem&&itemsData[carMainItem]?itemsData[carMainItem].images.icon:getUnequippedImageUrlForItemType("car", season)}></img>
          <div className="check" id={carMainItem?"ready":"not-ready"}><FontAwesomeIcon size="lg" icon={carMainItem?faCheckCircle:faTimesCircle} /></div>
        </span>
          <span className="item-tile" onClick={goToDriver}><img src={driverMainItem&&itemsData[driverMainItem]?itemsData[driverMainItem].images.icon:getUnequippedImageUrlForItemType("driver", season)}></img>
          <div className="check" id={driverMainItem?"ready":"not-ready"}><FontAwesomeIcon size="lg" icon={driverMainItem?faCheckCircle:faTimesCircle} /></div>
          
        </span>
        </div>  
        <div className="ready-text" id={ready?"ready":"not-ready"}>
        {t(readyText)}
        </div>
        <div className="buttons">
          <button id="time-trial" onClick = {goToTimeTrial} disabled={!ready}><div className="text">Time Trial
            <div className="play">{t("PLAY")}<FontAwesomeIcon size="sm" icon={faAngleDoubleRight}/></div></div>
          </button>
        </div>
      </div>
      </div>
    </Col>
}

export {TeamPane};