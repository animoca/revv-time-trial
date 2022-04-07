import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useRouteMatch} from 'react-router-dom';
import { Container, Modal, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ContentPane, ShowTries } from '../../components';
import { AuthContext, TimeTrialContext, SeasonContext, SeasonConsumer } from '../../components/Context';
import moment from 'moment';
import {trackDescriptions, trackRender, circuitRender, shadowRender, trackName, countryFlags, countryName} from './constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faClock, faAngleDoubleDown} from '@fortawesome/free-solid-svg-icons';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import {TutorialModals} from './Modals';
import {getBestDailyUserResult, getBestOverall, getTriesLeft} from '../../services/timeTrialService';
import {ReactComponent as Dry} from './img/icon-weather-dry.svg';
import {ReactComponent as Hot} from './img/icon-weather-hot.svg';
import {ReactComponent as HeavyRain} from './img/icon-weather-heavyrain.svg';
import {ReactComponent as LightRain} from './img/icon-weather-lightrain.svg';

const weatherIcons = {
  "Dry": <Dry />,
  "Hot": <Hot />,
  "LightRain": <LightRain />,
  "HeavyRain": <HeavyRain />
}

const addTriesContract = process.env.REACT_APP_TIMETRIAL_PURCHASE_CONTRACT;

function BestTime(props) {

  const defaultTimeFormat = '--:--.---';
  let {t} = useTranslation();
  const {user} = useContext(AuthContext)
  const { currentSeason } = useContext(SeasonContext);
  let {currentUser} = props.data;
  let [time, setTime] = useState(defaultTimeFormat);
  let [nickname, setNickname] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if(currentUser) {
        let res = await getBestDailyUserResult(currentSeason)
        setNickname('Your Team')
        if(res && res.time) {
          setTime(moment(new Date(res.time)).format('mm:ss.SSS'))
        }
        else {
          setTime(defaultTimeFormat);
        }
      } else {
        let res = await getBestOverall(currentSeason)
        if(res && res.time) {
          setTime(moment(new Date(res.time)).format('mm:ss.SSS'))
          setNickname(res.nickname)
        }
        else {
          setTime(defaultTimeFormat);
        }
      }
    }
    fetchData()
  }, [currentSeason])

  let classes = `best-time ${currentUser ? 'you' : ''}`
  return <div className={classes}>
    <div className="strap"></div>
    <div className="pane">
      <h4 className="heading">{currentUser ? t('Personal Best') : t('Fastest Lap')}</h4>
      <div className="standing">
        <h4 className="name"><b>{t(nickname)}</b></h4>
        <h4 className="time"><b>{time}</b></h4>
      </div>
    </div>
  </div>
}

function NextTrackPanel(props) {
  let {t} = useTranslation();
  let {nextTrack} = props.data;
  const [timer, setTimer] = useState(moment.duration(0))

  useEffect(() => {
    const zeroDarkTomorrow = new Date();
    zeroDarkTomorrow.setDate(zeroDarkTomorrow.getDate() + 1);
    zeroDarkTomorrow.setUTCHours(0, 0, 0, 0);
    let tmrl = moment.utc(zeroDarkTomorrow);

    const runner = setInterval(() => {
      let now = moment.utc()
      let duration = moment.duration(tmrl.diff(now))

      setTimer(duration);
    }, 2000)

    return () => clearInterval(runner)
  }, [])

  return <ContentPane title={t('Up Next')} className="next-track-panel">
    <div className="left">
      <div className="tt-country">
        <div className="track-country"><img src={countryFlags[nextTrack]} /></div>
        <div className="track-name">{countryName[nextTrack] ? t(countryName[nextTrack]) : t(nextTrack)}</div>
      </div>
      <div className="circuit-name">{trackName[nextTrack]}</div>
    </div>
    <div className="countdown right">
      <span className="icon">
        <FontAwesomeIcon size="sm" icon={faClock} />
      </span>
      {timer.humanize(true)}
    </div>
  </ContentPane>
}

function TrackDetails(props) {
  const {t, i18n} = useTranslation();
  const history = useHistory();
  const {user} = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext);
  const {tries, setTries, getTriesPrice, getPurchaseId, getPurchaseName } = useContext(TimeTrialContext)
  const {track} = props.data;
  const location = useLocation();
  let qs = new URLSearchParams(location.search);
  const teamOverride = qs.get('loadout');
  const {url} = useRouteMatch();
  const triesLeftText = t("Tries left");

  const connect = () => {
    history.push({pathname:'/connect',state:{from:location}})
  }
  
  const start = () => {
    let newUrl = `/timetrial/${currentSeason}/loadout`

    if(teamOverride)
      newUrl = newUrl + `?team=${teamOverride}`

    history.push(newUrl, history.location.state)
  }

  const isDisabled = () => {
    return !tries;
  }
  
  return <div className="track-details">
    <div className="top"><h3>{t('Track Details')}</h3></div>
    <div className="content">
      <div className="image">
        <img src={circuitRender[track]}></img>
      </div>
      <div className="description"><h4>{t(trackDescriptions[track])}</h4></div>
      <div className="ctrls">
        { <ShowTries tries={tries} data={{setTries, updateTries:getTriesLeft, triesLeftText, addTriesContract, getPurchaseId, getPurchaseName, getTriesPrice, withCreditCardOption: true }}/>
        }
        { user
          ? <Button variant="revv" onClick={start} disabled={isDisabled()} block>{t("Play")}</Button>
          : <Button variant="revv" onClick={connect} block>{t("Connect")}</Button>
        }
      </div>
    </div>
  </div>
}

function MBStickyBottom(props) {
  const {t, i18n} = useTranslation();
  const history = useHistory();
  const {user} = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext); 
  const {tries, setTries, getTriesPrice, getPurchaseId, getPurchaseName} = useContext(TimeTrialContext);
  const location = useLocation();
  const {url} = useRouteMatch();
  const triesLeftText = t("Tries left");

  const getTries = () => {
    return tries;
  }
  useEffect(() => {
    (async ()=> {
      if(user){
      const response = await getTriesLeft(currentSeason)
        .catch(err => { 
          console.error("Could not get profile!")
        });
        if(response)
          setTries(response)
      }
    })()
  }, [user, currentSeason]);

  const connect = () => {
    history.push({pathname:'/connect',state:{from:location}})
  }
  
  const start = () => {
    let newUrl = `/timetrial/${currentSeason}/loadout`

    history.push(newUrl, history.location.state)
  }

  return <div className="mb-sticky-bottom"> { user ?
      <>
      {
        <Button variant="revv" onClick={start} disabled={!tries} block>{t("Play")}</Button>
      }
      </>
    : <Button variant="revv" onClick={connect} block>{t("Connect")}</Button>
    } </div>
}

function TrackOverview(props) {
  const {t, i18n} = useTranslation();
  const {weather, track, nextTrack} = props.data;
  const [showTut, setShowTut] = useState(false);
  const {user} = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext);

  return <div className="track-overview">
      <div className="top">
        <div className="track-country"><img src={countryFlags[track]} /></div>
        <div className="track-name"><h2>{countryName[track] ? t(countryName[track]) : t(track)}</h2></div>
        <div className="circuit-name">{trackName[track]}</div>
        {/* <Button variant="outline-revv" className="tut-btn" onClick={() => setShowTut(true)}>How To Play</Button> */}
      </div>
      <TutorialModals show={showTut} setShow={setShowTut} />
      <div className="track">
        <div className="track-image">
            {/* #region TRACT_IMAGES
            <img className="render" src={trackRender[track]} />
            <img className="shadow" src={shadowRender[track]} /> */}
            <img className="render" src="" />
            <img className="shadow" src="" />
        </div>
        <div className="image-overlay"></div>
        <OverlayTrigger 
          overlay={<Tooltip>{t(weather)}</Tooltip>}
          placement="top">
          <div className="overlay-content weather-icon">{weatherIcons[weather]}</div>
        </OverlayTrigger>
        
        <div className="overlay-content top-times">
          {user ? 
          <BestTime data={{currentUser: true, currentSeason}} /> 
          : <></>}
          <BestTime data={{currentUser: false, currentSeason}} />
        </div>
      </div>
      <div className="bot">
        <NextTrackPanel data={{nextTrack}}/>
        <div className="btns">
          <div className="standings-button"><AnchorLink href="#tabbed-standings" offset="62"><FontAwesomeIcon size="sm" icon={faAngleDoubleDown} />{t('Current Standings')}</AnchorLink></div>
        </div>
      </div>
      {/* <TutorialModals show={showTut} setShow={setShowTut} /> */}
    </div>
}

function MBestTimes(props) {
  const {user} = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext);

  return <div className="top-times mobile-only">
    {user ? <BestTime data={{currentUser: true, currentSeason}}  /> : <></>}
    <BestTime data={{currentUser: false, currentSeason}} />
  </div>
}

function TrackSummary(props) {
  const {t, i18n} = useTranslation();
  let {track, weather} = props.data;

  return <div className="track-summary">
    <div className="top">
      <div className="d-flex ai-center">
      <div className="track-country"><img src={countryFlags[track]} /></div>
      <div className="track-name"><h2>{countryName[track] ? t(countryName[track]) : t(track)}</h2></div>
      </div>
      <div className="circuit-name">{trackName[track]}</div>
    </div>
    <div className="content">
      <div className="description">
        <div className="text"><h4>{t(trackDescriptions[track])}</h4></div>
      </div>
      <div className="image">
          {/* #region TRACT_IMAGES
          <img src={trackRender[track]}></img> */}
      </div>
      <div className="icons">
        <div className="track icon-wp"><img src={circuitRender[track]}></img></div>
        <OverlayTrigger 
          overlay={<Tooltip>{t(weather)}</Tooltip>}
          placement="top">
          <div className="weather icon-wp">{weatherIcons[weather]}</div>
        </OverlayTrigger>
      </div>
    </div>
  </div>
}

export {TrackOverview, TrackDetails, TrackSummary, MBestTimes, NextTrackPanel, MBStickyBottom}