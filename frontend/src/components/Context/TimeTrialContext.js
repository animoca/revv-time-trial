import React, { useState, useEffect, useReducer, useContext } from 'react';
import {getStatus, getWeeklyRewards} from '../../services/timeTrialService';
import { SeasonContext } from '../Context';
import moment from 'moment';

const TimeTrialContext = React.createContext();
const TimeTrialConsumer = TimeTrialContext.Consumer;
const purchaseData = {
    price : {
      usd:'1',
      revv:'10'
    },
    purchaseId: 'single retry',
    purchaseName: 'Time Trial Tries'
}

function TimeTrialProvider(props) {
    const [track, setTrack] = useState(null)
    const [nextTrack, setNextTrack] = useState(null)
    const [weather, setWeather] = useState(null)
    const startOfWeek = moment.utc().startOf('isoWeek')
    const endOfWeek = moment.utc().endOf('isoWeek')
    const startOfLastWeek = moment.utc().startOf('isoWeek').subtract(1, 'week')
    const endOfLastWeek = moment.utc().endOf('isoWeek').subtract(1, 'week')
    const [compId, setCompId] = useState(null)
    const [compTyre, setCompTyre] = useState(null)
    const [compCar, setCompCar] = useState(null)
    const [compDriver, setCompDriver] = useState(null)
    const [tries, setTries] = useState(0)
    const [trackData, setTrackData] = useState({})
    const [rewardEth, setRewardEth] = useState(0)
    const [rewardRevv, setRewardRevv] = useState(0)
    const [compStats, setCompStats] = useState(0)
    const [showEth, setShowEth] = useState(false);
    const { currentSeason } = useContext(SeasonContext);

    function lbReducer(state, action) {
        switch(action.type) {
        case 'upsert':
            const newLb = {[action.tier]: action.data}
            return {...state, ...newLb}
        default:
            throw new Error("reducer action not defined.")
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            let res = await getStatus(currentSeason).catch(e => {
                console.error(e);
            })
            if(res) {
                setTrackData(res.week)
                setWeather(res.weather)
                setTrack(res.track)
                setNextTrack(res.next.track)
            }
        }
        fetchData()
    }, [currentSeason])

    useEffect(() => {
        let fetchData = async () => {
            let res = await getWeeklyRewards(currentSeason);
            if(res) {
                setRewardEth(res.eth)
                setRewardRevv(res.revv)
            }
        }
        fetchData()
    }, [currentSeason])

    const getTriesPrice = (paymentType) => {
        return purchaseData.price[paymentType];
    }

    const getPurchaseId = () => {
        return purchaseData.purchaseId;
    }

    const getPurchaseName = () => {
        return purchaseData.purchaseName;
    }

    useEffect(() => {
        const now = new Date().getTime();

        if(now < 1607904000000) {
            setShowEth(true);
        }
    }, [])

    return <TimeTrialContext.Provider
        value={{
            track, setTrack,
            weather, setWeather,
            nextTrack, setNextTrack,
            startOfWeek, endOfWeek,
            startOfLastWeek, endOfLastWeek,
            compId, setCompId,
            compCar, setCompCar,
            compDriver, setCompDriver,
            compTyre, setCompTyre,
            tries, setTries,
            trackData, setTrackData,
            rewardEth, rewardRevv, showEth,
            compStats, setCompStats,
            getTriesPrice,
            getPurchaseId,
            getPurchaseName
        }}>
        {props.children}
    </TimeTrialContext.Provider>
}


export { TimeTrialContext, TimeTrialProvider, TimeTrialConsumer };