import React, { useContext, useEffect, useState } from 'react';
// import { Form, Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getUser, profanityCheck, register, verifyAddress } from '../services/httpService';
import { Web3Context } from '../web3';
import fortmaticLogo from '../assets/img/logos/logo-fortmatic.svg';
import dapperLogo from '../assets/img/logos/logo-dapper.svg';
import bitskiLogo from '../assets/img/logos/logo-bitski.svg';
import metamaskLogo from '../assets/img/logos/logo-metamask.svg';
import portisLogo from '../assets/img/logos/logo-portis.svg';
import walletConnectLogo from '../assets/img/logos/logo-walletconnect.svg';
import './Fragments.scss';
import { AddressVerfiedModal } from '../components/dialogs';
import { AuthContext } from '../components/Context';
import ReactGA from 'react-ga';

function ConnectExisting(props) {
    
    const emailTest = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    let {t} = useTranslation();

    let emailAddressValid = true;
    const CHAIN_ID = process.env.REACT_APP_CHAIN_ID;

    const authContext = useContext(AuthContext);

    const {web3, ready, connect, disconnect, sign, walletConnectors, selectedAccount, ...web3Context} = useContext(Web3Context);

    const [signature, setSignature] = useState(undefined);
    const [showModal, setShowModal] = useState(false);
    const [values, setValues] = useState({nickname: '', age: 0, email: ''});
    const [hasProfanity, setHasProfanity] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    
    const [isAccountValid, setIsAccountValid] = useState(false);

    const handleModalShow = () => setShowModal(true);
    const handleModalClose = () => setShowModal(false);

    const handleHasProfanity = () => setHasProfanity(true);
    const handleDoesntHaveProfanity = () => setHasProfanity(false);

    const handleInputChange = e => {
        const {name, value} = e.target;

        setValues({...values, [name]: value});
    };

    let injectedWallet = null;

    if (window.ethereum && window.ethereum.isMetaMask) {
        injectedWallet = "metamask";
    }
    else {
        if (window.web3)
        {
            if(window.web3.currentProvider.isDapper || window.web3.currentProvider.constructor.name == "CustomProvider" || window.web3.currentProvider.connection.constructor.name == "DapperLegacyProvider") {
                injectedWallet = "dapper";
            }
        }
    }

    let walletsAvailable = [
        // {
        //     name: 'Fortmatic',
        //     connector: 'fortmatic',
        //     img: fortmaticLogo,
        // },
        {
            name: 'Metamask',
            connector: 'metamask',
            img: metamaskLogo,
            installUrl : (injectedWallet != "metamask") ? "https://metamask.io" : null
        },
        // {
        //     name: 'Wallet Connect',
        //     connector: 'walletConnect',
        //     img: walletConnectLogo,
        // },
        // {
        //     name: 'Dapper',
        //     connector: 'dapper',
        //     img: dapperLogo,
        //     installUrl : (injectedWallet != "dapper") ? "https://www.meetdapper.com/" : null
        // },
        // {
        //     name: 'Portis',
        //     connector: 'portis',
        //     img: portisLogo,
        // },
        // {
        //     name: 'Bitski',
        //     connector: 'bitski',
        //     img: bitskiLogo,
        // },
    ];

    if (window.innerWidth < 768) {
        walletsAvailable = walletsAvailable.filter(el => el.name !== 'Dapper');
    }

    const submitRegisterForm  = async () =>  {
        console.log(`signature:  ${signature}`);
        setEmailValid(emailTest.test(values.email));
        if (emailTest.test(values.email) && !(await isProfanity(values.nickname))) {
            const payload = {
                walletAddress: selectedAccount,
                chainId: CHAIN_ID,
                ...values,
            };
            console.log('register payload: ', payload);
            register(payload)
            .then(res => {
                setIsAccountValid(true);
                authContext.login(res);
                console.log(`REGI res: `, res);
                if (!res.hasOwnProperty('error')) {
                    handleModalClose();
                }
                // sendEmailVerification(values.emailAddress)
                // .then(res => console.log(res.status))
                // .catch(err => console.error(err.message));
            });
        } else {
            console.log(`profanity detected`);
        }
    }

    const isProfanity = async (val) => {
        console.info(`runProfanityCheck ${val}`);
        const res = await profanityCheck(val)
        let hasProfanity = true;
        if(res.status === 200) {
            hasProfanity = false;
        }
        setHasProfanity(hasProfanity);
        return hasProfanity;
    }

    return (
        <>
            <AddressVerfiedModal show={true}></AddressVerfiedModal>
            <fieldset className="content-register-border content-left connect-new-fieldset">
                <legend className="beginners-legend">
                    <h3>{t('Advanced Players')}</h3></legend>
                <p className="connect-account-instruction">
                    {t('Please connect to your wallet and login your REVV Time Trial account.')}
                </p>
                <div className="connect-btns-well">
                    {
                        walletsAvailable.map((el, id) => {
                            let com;
                            if(el.installUrl) {
                                com = (
                                    <ReactGA.OutboundLink eventLabel="Connect" to={el.installUrl} target="_blank" key={id}>
                                        <div key={el.connector} className="connect-wallet-buttons">
                                            <img src={el.img} className={`connect-btn-img ${el.connector}-logo`}/>
                                        </div>
                                    </ReactGA.OutboundLink>
                                    )
                            } else {
                                com = (<div key={el.connector}
                                    className="connect-wallet-buttons"
                                    onClick={() => props.onSelectWallet(el.connector)}
                                    >
                                        <img src={el.img} className={`connect-btn-img ${el.connector}-logo`}/>
                                    </div>)
                            }

                            return com;
                        })
                    }
                </div>
            </fieldset>
        </>
    );
}

export default ConnectExisting;
