import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { Container, Tabs, Tab, Button } from 'react-bootstrap';
import {useHistory, useLocation} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDailyLeaderboard, getWeeklyLeaderboard, getLeaderboards } from '../../services/timeTrialService';
import { TimeTrialContext, AuthContext, SeasonContext } from '../../components/Context';
import {trackName, countryName, countryFlags, tierInfo} from './constants';
import {LeaderboardNew} from '../../components/Leaderboard';
import {formatCurrency} from './helper';
import {ReactComponent as Dry} from './img/icon-weather-dry.svg';
import {ReactComponent as Hot} from './img/icon-weather-hot.svg';
import {ReactComponent as HeavyRain} from './img/icon-weather-heavyrain.svg';
import {ReactComponent as LightRain} from './img/icon-weather-lightrain.svg';
// import revvIcon from '../../assets/images/icon-revv.svg';
// import towerIcon from './img/logo-tower.png';
// import AtariIcon from './img/logo-atri.png';
import './scss/TabbedStandings.scss';

const weatherIcons = {
  "Dry": <Dry />,
  "Hot": <Hot />,
  "LightRain": <LightRain />,
  "HeavyRain": <HeavyRain />
}

function OverviewTabbedStandings(props) {
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();

  return <div className="overview-tabbed-standings" id="tabbed-standings"><Container>
    <div><h2 className="tl-center">{t('Time Trial Weekly Standings')}</h2></div>
    <TabbedStandings {...props}/>
  </Container></div>
}

function TabbedStandings(props) {
  const { currentSeason } = useContext(SeasonContext);
  const [dailies, setDailies] = useState([]);
  const [weekly, setWeekly] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let leaderboards = await getLeaderboards(currentSeason)
        .catch(e => console.error(e))
      if(leaderboards) {
        setDailies(leaderboards.daily);
        setWeekly(leaderboards.weekly);
      }
    }

    fetchData();
  }, [currentSeason]);

  return (
    <div className="tabbed-standings">
    <Tabs defaultActiveKey={'A'} mountOnEnter unmountOnExit>
      {['A', 'B', 'C', 'D'].map(tier => {
        // {['D'].map(tier => {
        const tabC = `tabbed-tier tier-${tier.toLowerCase()}`
        const lbC = `leaderboards tier-${tier.toLowerCase()}`

        return (
          <Tab tabClassName={tabC} eventKey={tier} title={<></>} key={tier}>
            <div className={lbC}>
              <div className="new-leaderboard tabbed-leaderboard lb"><TabbedLeaderboard data={{tier, currentSeason, type: 'time'}} dailies={dailies} {...props}/></div>
              <div className="tabbed-leaderboard lb"><TabbedWeeklyLeaderboard data={{ tier, weekly, currentSeason, type: 'score' }} dailies={dailies} {...props}/></div>
            </div>
          </Tab>
        )})}
    </Tabs>
    </div>
  );
}

function TabbedWeeklyLeaderboard(props) {
  const {tier, weekly, type} = props.data;
  const {dailies,} = props;
  const { currentSeason } = useContext(SeasonContext);
  const {startOfWeek, endOfWeek, startOfLastWeek, endOfLastWeek} = useContext(TimeTrialContext)
  const {user, initialUserLoaded} = useContext(AuthContext);
  const [prevRank, setPrevRank] = useState({});
  const currDay = new Date().getUTCDay() || 7;
  const { t } = useTranslation();

  useEffect(() => {
    // get all dailies up til yesterday
    const getDaily = async (path) => getDailyLeaderboard({
      tier,
      path
    }, currentSeason)

    const fetchScores = async () => {
      const paths = dailies.filter((x, i) => i < currDay - 1)
      const res = await Promise.all(paths.map(getDaily))
      // console.log(paths, res)

      let scorePrevDay = {};
      res.flatMap(x => x).forEach(entry => {
        if(!scorePrevDay[entry.walletAddress]) {
          scorePrevDay[entry.walletAddress] = entry.score || 0
        } else {
          scorePrevDay[entry.walletAddress] += entry.score
        }
      })

      setPrevRank(Object.keys(scorePrevDay)
        .sort((a, b) => scorePrevDay[b] - scorePrevDay[a])
        .reduce((acc, addr, i) => {
          acc[addr] = i + 1; 
          return acc 
        }, {}))
    }

    if(currDay > 1) {
      fetchScores();
    } 

  }, [dailies, currentSeason, tier])

  const fetchWeekly = useCallback((path) => {
    // console.info(path, tier, currentSeason, weekly.length, initialUserLoaded)
    if(path) {
      return getWeeklyLeaderboard({
        tier,
        path,
        walletAddress: user ? user.walletAddress : null
      }, currentSeason)
    } else {
      return [];
    }
  }, [tier, currentSeason, weekly.length, initialUserLoaded])

  const format = (entry) => {
    return {
        ...entry, 
        score: entry.time || entry.score,
        delta: entry.rank - prevRank[entry.walletAddress],
        isCurrentUser: user ? entry.walletAddress.toLowerCase() === user.walletAddress.toLowerCase() : false
    }
}

  return <Tabs defaultActiveKey="currWeek" className="tt-lb-tabs weekly" mountOnEnter unmountOnExit>
    <Tab eventKey={'lastWeek'} title={"Last Week"} key={0}>
      <LeaderboardNew fetchLeaderboard={() => fetchWeekly(weekly[0])}>
        <div className="h-top weekly">
          <h3>{t('Last Week')}</h3>
          <p className="week">{startOfLastWeek.format('MMM DD')} - {endOfLastWeek.format('MMM DD YYYY')}</p>
        </div>
      </LeaderboardNew>
    </Tab>
    <Tab eventKey={'currWeek'} title={"This Week"} key={1}>
      <LeaderboardNew fetchLeaderboard={() => fetchWeekly(weekly[1])} formatRows={format} showDelta>
        <div className="h-top weekly">
          <h3>{t('This Week')}</h3>
          <p className="week">{startOfWeek.format('MMM DD')} - {endOfWeek.format('MMM DD YYYY')}</p>
        </div>
      </LeaderboardNew>
    </Tab>
  </Tabs>
}

function TabbedLeaderboard(props) {
  let week = {
    1: 'MON',
    2: 'TUE',
    3: 'WED',
    4: 'THU',
    5: 'FRI',
    6: 'SAT',
    7: 'SUN'
  }

  const {user, initialUserLoaded} = useContext(AuthContext);
  const {trackData} = useContext(TimeTrialContext);
  const { currentSeason } = useContext(SeasonContext);
  const {tier, type} = props.data;
  const {dailies} = props;
  const currDay = new Date().getUTCDay() || 7;
  const { t } = useTranslation();
  
  const getTimeTrialLeaderboard = useCallback(async (path) => {
    return getDailyLeaderboard({
      tier,
      path,
      walletAddress: user ? user.walletAddress : null,
    }, currentSeason)
  }, [initialUserLoaded, dailies.length, currentSeason])
  
  return <Tabs defaultActiveKey={currDay} className="tt-lb-tabs" mountOnEnter unmountOnExit>
    {dailies.length && Object.keys(week).map(day => {
      const dTrack = trackData[dailies[day-1]];
      return <Tab eventKey={day} title={week[day]} disabled={day > currDay} key={day}>
        {dailies[day-1] ? 
          <LeaderboardNew fetchLeaderboard={getTimeTrialLeaderboard.bind(null, dailies[day-1])} type="time" key={day}>
            {dTrack ?
            <div className="h-top d-flex jc-space-between">
              <div className="left">
                <div className="d-flex ai-center l-align">
                <div className="track-country"><img src={countryFlags[dTrack.track]} /></div>
                <h3>{countryName[dTrack.track]? t(countryName[dTrack.track]): t(dTrack.track)}</h3>
                </div>
                <p>{dTrack && trackName[dTrack.track]}</p>
              </div>
              <div className="right">{weatherIcons[dTrack.weather]}</div>
            </div>
            : <></>}
          </LeaderboardNew>
        : <></> /* dont render day if path doesn't exist */}
      </Tab>
    })}
  </Tabs>
}


export { OverviewTabbedStandings, TabbedStandings }