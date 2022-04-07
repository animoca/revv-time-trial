import React, {useContext, useState, useEffect} from 'react';
import moment from 'moment';
import {Container, Row, Button} from 'react-bootstrap';
import {useTranslation} from 'react-i18next';
import { TimeTrialContext } from '../../components/Context';
import iconClock from './img/icon-clock.svg';
import './scss/RewardsCountdown.scss';
import ethIcon from '../../assets/images/icon-eth.svg';
import revvIcon from '../../assets/images/icon-revv.svg';

function RewardsCountdown(props) {
    const [t] = useTranslation();
    const {startOfWeek, endOfWeek, rewardEth, rewardRevv, showEth} = useContext(TimeTrialContext)
    const [daysLeft, setDaysLeft] = useState(0);
    const [hoursLeft, setHoursLeft] = useState(0);
    const [minutesLeft, setMinutesLeft] = useState(0);

    useEffect(() => {
        const countDownDate = new Date(`${endOfWeek.format('MMM DD YYYY')} 23:59:59`);
        countDownDate.setUTCHours(23, 59, 59, 0);
        countDownDate.setUTCDate(parseInt(startOfWeek.format('DD')) + 6);
        let deadline = moment.utc(countDownDate);
    
        const runner = setInterval(() => {
          let now = moment.utc()
          let duration = moment.duration(deadline.diff(now));
          setDaysLeft(moment(duration._data).format("D"));
          setHoursLeft(moment(duration._data).format("H"));
          setMinutesLeft(moment(duration._data).format("m"));
        }, 2000)
    
        return () => clearInterval(runner)
    }, [])

    return <div id="wr-wrapper">
        <Container id="home">
            <div className="weekly-rewards">
                <div className="reward-desc">
                    <div className="left">
                        <div className="timeline">
                            <h2>{t('Time Trial')}<br/>{t('Current Pool')}</h2>
                        </div>
                        <h3>{startOfWeek.format('MMM DD')} - {endOfWeek.format('MMM DD YYYY')}</h3>
                        {showEth ? <p>{t('The top 3 will be rewarded ETH at the end of the week')}</p> : <></>}
                        <div className="reward-pools">
                            {showEth ? <div className="reward-tag">
                                <span className="currency-icon"><img src={ethIcon} /></span>
                                <span className="num-eth">{parseFloat(12000).toFixed(4)}</span>
                            </div> : <></>}
                            <div className="reward-tag">
                                <span className="currency-icon"><img src={revvIcon} /></span>
                                <span className="num-eth">{parseFloat(12000).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="time-remaining">
                            <img className="clock-icon" src={iconClock} />
                            <p>Time Remaining</p>
                        </div>
                        <div className="countdown">
                            <div className="countdown-panel">
                                <div className="wrapper">
                                    <h3 className="countdown-num" id="days">{daysLeft}</h3>
                                    <p className="countdown-text">days</p>
                                </div>
                            </div>
                            <div className="countdown-panel">
                                <div className="wrapper">
                                    <h3 className="countdown-num" id="hours">{hoursLeft}</h3>
                                    <p className="countdown-text">hours</p>
                                </div>
                            </div>
                            <div className="countdown-panel">
                                <div className="wrapper">
                                    <h3 className="countdown-num" id="minutes">{minutesLeft}</h3>
                                    <p className="countdown-text">mins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Button className="go-timetrial" variant="revv" href='/timetrial'>{t('Go TimeTrial')}</Button>
        </Container>
    </div>
}

export {RewardsCountdown}