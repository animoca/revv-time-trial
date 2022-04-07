
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Modal, Button, Tooltip, OverlayTrigger, Container} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import {race, getBestDailyUserResult, getBestDailyResult} from '../../services/timeTrialService';
import { getFullMetaDataFromTokenId, getImageUrlForItem } from '../../services/nftData';
import { AuthContext, SeasonContext, TimeTrialContext } from '../../components/Context';
import {LeaderboardNew, LeaderboardRowNew} from '../../components/Leaderboard';
import { trackRender, circuitRender, trackName, countryName, countryFlags} from './constants';
import { sampleChatter } from './chatter';
import {RaceFinishModal} from './Modals';
import {lp} from './helper';
import {ReactComponent as Dry} from './img/icon-weather-dry.svg';
import {ReactComponent as Hot} from './img/icon-weather-hot.svg';
import {ReactComponent as HeavyRain} from './img/icon-weather-heavyrain.svg';
import {ReactComponent as LightRain} from './img/icon-weather-lightrain.svg';

import './scss/RacePage.scss';


const weatherIcons = {
  "Dry": <Dry />,
  "Hot": <Hot />,
  "LightRain": <LightRain />,
  "HeavyRain": <HeavyRain />
}

function RacePage(props) {
  const { t } = useTranslation();
  const history = useHistory();
  const { track, weather, compId, compCar, compDriver, compTyre } = useContext(TimeTrialContext)
  const { currentSeason } = useContext(SeasonContext);
  const [ready, setReady] = useState(false);
  const [car, setCar] = useState(null)
  const [driver, setDriver] = useState(null)
  const [tyre, setTyre] = useState(null)

  useEffect(() => {
    if(!compCar || !compDriver || !compTyre) {
      history.push(`/timetrial/${currentSeason}/loadout`)
    }

    try {
      let car = getFullMetaDataFromTokenId(compCar)
      let driver = getFullMetaDataFromTokenId(compDriver)
      let tyre = getFullMetaDataFromTokenId(compTyre)

      setCar(car)
      setDriver(driver)
      setTyre(tyre)
    } catch(e) {
      console.error(e)
    } finally {
      setReady(true)
    }

    // solve scrollbar flicker issue
    document.body.classList.add("scrollbar-flicker-fix")

    return () => {
      setReady(false)
      document.body.classList.remove("scrollbar-flicker-fix")
    }
  }, [])

  return <div id="timetrial" className="page-wrapper-bg-race-view">
    <div className="track-race-view">
      <div className="left">
        <div className="track-info">
        <div className="d-flex ai-center">
          <div className="track-country"><img src={countryFlags[track]} /></div>
          <h2>{countryName[track] ? t(countryName[track]): t(track)}</h2></div>
          <p>{trackName[track]}</p>
        </div>
        <div className="best-times">
          <SimulateTime data={{compId, compTyre, weather, track}} ready={ready} />
          <BestTime />
        </div>
        <div className="your-team">
          <div className="header">
            <h4>{t('Your Team')}</h4>
          </div>
          <div className="team-comp">
            {car && <div><div className="comp-img"><img src={getImageUrlForItem(car).icon} /></div>{car.name}</div>}
            {driver && <div><div className="comp-img"><img src={getImageUrlForItem(driver).icon} /></div>{driver.name}</div>}
            {tyre && <div><div className="comp-img"><img src={getImageUrlForItem(tyre).icon} /></div>{tyre.name}</div>}
          </div>
        </div>
      </div>

      <div className="right">
        <div className="track">
          <div className="track-image" style={{backgroundImage: `url(${trackRender[track]})`}}>
            {/* #region TRACT_IMAGES
              <img src={trackRender[track]}></img> */}
          </div>
          <div className="overlay-content">
            <div className="circuit oc"><img src={circuitRender[track]} /></div>
            <OverlayTrigger 
              overlay={<Tooltip>{t(weather)}</Tooltip>}
              placement="top">
              <div className="weather-icon oc">{weatherIcons[weather]}</div>
            </OverlayTrigger>
          </div>
        </div>
      </div>
    </div>
  </div>
}

function RaceResultModal(props) {
  const { time, show, setShow, tier} = props;
  const handleHide = () => setShow(false);
  const { track, weather, compStats } = useContext(TimeTrialContext);
  const { currentSeason } = useContext(SeasonContext);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const { t } = useTranslation();

  const handleRetry = () => {
    history.push(`./loadout`);
  }

  const handleFinish = () => {
    handleHide();
    history.push('./', {refreshLb: true})
  }

  const getTimeTrialLeaderboard = useCallback(async (tier, currentSeason) => {
    return await getBestDailyResult(tier, currentSeason);
  }, [tier, currentSeason, time])

  const timeHeader = <div className="lb-header">
    <div className="left">
      <h3>{countryName[track]? t(countryName[track]): t(track)}</h3>
      <p>{trackName[track]}</p>
    </div>
    <div className="right">{weatherIcons[weather]}</div>
  </div>

  return <Modal show={show} onHide={handleHide} dialogClassName="result-modal" centered backdrop="static">
    <Modal.Header className="leaderboard">
      <div className="result-row">
        <h3>{t('Lap Time')}</h3>
        <Container>
          <LeaderboardRowNew rank="-" nickname={user.nickname} isCurrentUser={true} score={time} type="time" />
        </Container>
      </div>
    </Modal.Header>
    <Modal.Body className="leaderboard">
      <LeaderboardNew fetchLeaderboard={() => getTimeTrialLeaderboard(tier, currentSeason)} type="time">
        {timeHeader}
      </LeaderboardNew>
      
      {/* {rows && rows.map(entry => <LeaderboardRow data={entry} key={entry.rank} />)} */}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="revv-secondary" onClick={handleRetry}>Retry</Button>
      <Button variant="revv" onClick={handleFinish}>{t('Finished')}</Button>
    </Modal.Footer>
  </Modal>
}

function SimulateTime(props) {
  let {t} = useTranslation();
  const {user} = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext);
  const history = useHistory();
  const {compId, compTyre, weather, track} = props.data;
  const [lapTime, setLapTime] = useState(null)
  const [mi, setMi] = useState(0)
  const [se, setSe] = useState(0)
  const [ms, setMs] = useState(0)
  const [test, setTest] = useState(moment.duration(0))
  const [show, setShow] = useState(false)
  const [showRaceFin, setShowRaceFin] = useState(false)
  const [showChatter, setShowChatter] = useState(false)
  const [tier, setTier] = useState(null)

  useEffect(() => {
    let cancel = false;
    const fetchRaceTime = async () => {
      const {tier} = history.location.state;
      try {
        const res = await race({compId, tyresToken: compTyre, tier}, currentSeason)
          
        if(!cancel) {
          setTier(res.tier);
          setLapTime(res.finalLapTime);
        }
      } catch(e) {
        console.error(e)
      }
    }
    if(props.ready) fetchRaceTime();

    return () => {cancel = true}
  }, [user, props.ready])

  useEffect(() => {
    const REFRESH_RATE = 100;
    var runner;

    let update = () => {
      let duration = test.add(REFRESH_RATE * 3, 'ms')

      if(duration.asMilliseconds() > lapTime) {
        duration = moment.duration(lapTime);
        setShowRaceFin(true)
        clearInterval(runner)
      }

      setMi(duration.minutes())
      setSe(duration.seconds())
      setMs(duration.milliseconds())
    }

    if(lapTime) {
      runner = setInterval(update, REFRESH_RATE);
    }

    return () => {clearInterval(runner)}
  }, [lapTime])

  return <div className='best-time simulate'>
    <div className="strap"></div>
    <div className="pane">
      <h4 className="heading">{t('Lap Time')}</h4>
      <div className="standing">
        <h3 className="time"><b>{lp(mi)}:{lp(se)}.{lp(ms, true)}</b></h3>
      </div>
    </div>
    <RaceResultModal time={lapTime} show={show} setShow={setShow} tier={tier}/>
    <RaceFinishModal show={showRaceFin} setShow={setShowRaceFin} cb={() => setShow(true)} />
    <ChatterModal time={lapTime} show={showChatter} setShow={setShowChatter} weather={weather} track={track}/>
  </div>
}

function ChatterModal(props) {
  let {t} = useTranslation();
  const {show, setShow, time, weather, track} = props;
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(moment.duration(0))

  useEffect(() => {
    const REFRESH_RATE = 3300;
    var runner;

    let update = () => {
      setShow(true);
      let duration = elapsed.add(REFRESH_RATE * 3, 'ms')

      if(duration.asMilliseconds() < 10100) {
        weather && setText(sampleChatter(weather))
      } else if(duration.asMilliseconds() < 20100) {
        setText(sampleChatter(track))
      } else if (duration.asMilliseconds() < 30100) {
        setText(sampleChatter('start'))
      } else if(time - duration.asMilliseconds() < 10100) {
        setText(sampleChatter('end'))
        clearInterval(runner)
      } else {
        setText(sampleChatter('general'))
      }
    }

    if(time) {
      update();
      runner = setInterval(update, REFRESH_RATE);
    }

    return () => {clearInterval(runner)}
  }, [time])

  useEffect(() => {
    if(show) {
      setTimeout(() => setShow(false), 2500);
    }
  }, [show])

  return <Modal backdrop={false} show={show} dialogClassName="chatter-modal" centered>
    <h3>{t(text)}</h3>
  </Modal>
}

function BestTime(props) {
  let {t} = useTranslation();
  const { currentSeason } = useContext(SeasonContext);
  let [time, setTime] = useState('00:00.000');

  useEffect(() => {
    let cancel = false;
    const fetchData = async () => {
      let res = await getBestDailyUserResult(currentSeason);
      if(!cancel && res && res.time) {
        let time = moment(new Date(res.time)).format('mm:ss.SSS')
        setTime(time)
      }
    }

    fetchData()

    return () => {cancel = true}
  }, [currentSeason])

  return <div className='best-time pb'>
    <div className="strap"></div>
    <div className="pane">
      <h4 className="heading">{t('Personal Best')}</h4>
      <div className="standing">
        <h4 className="time"><b>{time}</b></h4>
      </div>
    </div>
  </div>
}


export { RacePage }