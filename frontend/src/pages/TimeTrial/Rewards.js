import React, {useContext, useState, useEffect} from 'react';
import {Container, Row} from 'react-bootstrap';
import {useTranslation} from 'react-i18next';
import { TimeTrialContext } from '../../components/Context';
import './scss/Rewards.scss';
import revvIcon from '../../assets/images/icon-revv.svg';
import ethIcon from '../../assets/images/icon-eth.svg';
import sandIcon from './img/logo-sand-32.svg';
import towerIcon from './img/logo-tower.png';
// import GameeIcon from './img/logo-gamee-32.svg';
// import AtariIcon from './img/logo-atri.png';

function Rewards(props) {
    const [t] = useTranslation();
    const {startOfWeek, endOfWeek, rewardEth, rewardRevv, showEth} = useContext(TimeTrialContext)
    
    return <div id="wr-wrapper">
        <Container className="tt-weekly-rewards">
            <div className="reward-desc">
                <div className="timeline">
                    <h2>{t('Current Pool')}</h2>
                    <h3>{startOfWeek.format('MMM DD')} - {endOfWeek.format('MMM DD YYYY')}</h3>
                </div>
                {showEth ? <p>{t('The top 3 will be rewarded ETH at the end of the week')}</p> : <></>}
                {showEth ? <div className="reward-tag"><span className="currency-icon"><img src={ethIcon} /></span> {parseFloat(12000).toFixed(4)}</div> : <></>}
                <div className="reward-tag"><span className="currency-icon"><img src={revvIcon} /></span> {parseFloat(12000).toFixed(2)}</div>
            </div>
        </Container>
    </div>
}


export {Rewards}