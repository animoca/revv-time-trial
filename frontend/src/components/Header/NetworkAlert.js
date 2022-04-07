import React, {useContext, useEffect, useState} from 'react';
import {Web3Context} from '../../web3';
import {AuthContext} from '../Context';
import './Nav.scss';

const envId = parseInt(process.env.REACT_APP_CHAIN_ID);

export function NetworkAlert(props) {
    const {networkId} = useContext(Web3Context);
    const [wrongNetwork, setWrongNetwork] = useState(false);
    const {user} = useContext(AuthContext);

    useEffect(() => {
        const checkNetwork = async () => {
            if(networkId && networkId !== envId) {
                setWrongNetwork(true);
            } else {
                setWrongNetwork(false);
            }
        }

        if(user) {
            checkNetwork();
        } else {
            setWrongNetwork(false);
        }
    }, [user, networkId])

    return wrongNetwork ? <div id="network-alert">Wrong wallet network detected, please switch to {process.env.REACT_APP_DEFAULT_WEB3_PROVIDER_ID}.</div> : <></>
}