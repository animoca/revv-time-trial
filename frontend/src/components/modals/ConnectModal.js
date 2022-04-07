import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {customConfirm} from '../helper';
import {Web3Context} from '../../web3';
import {AuthContext} from '../Context';
import { verifyAddress } from '../../services/httpService';

import ReactGA from 'react-ga';
import fortmaticLogo from '../../assets/img/logos/logo-fortmatic.svg';
import dapperLogo from '../../assets/img/logos/logo-dapper.svg';
import bitskiLogo from '../../assets/img/logos/logo-bitski.svg';
import metamaskLogo from '../../assets/img/logos/logo-metamask.svg';
import portisLogo from '../../assets/img/logos/logo-portis.svg';
import walletConnectLogo from '../../assets/img/logos/logo-walletconnect.svg';

import './ConnectModal.scss'

function ConnectModal({confirm, ...props}) {
    const {t} = useTranslation();

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

    const handleConnect = (connector) => {
        confirm(connector)
    }

    let walletsAvailable = [
        {
            name: 'Fortmatic',
            connector: 'fortmatic',
            img: fortmaticLogo,
        },
        {
            name: 'Metamask',
            connector: 'metamask',
            img: metamaskLogo,
            extension: true,
            installUrl : (injectedWallet != "metamask") ? "https://metamask.io" : null
        },
        {
            name: 'Wallet Connect',
            connector: 'walletConnect',
            img: walletConnectLogo,
        },
        {
            name: 'Dapper',
            connector: 'dapper',
            img: dapperLogo,
            extension: true,
            installUrl : (injectedWallet != "dapper") ? "https://www.meetdapper.com/" : null
        },
        {
            name: 'Portis',
            connector: 'portis',
            img: portisLogo,
        },
        {
            name: 'Bitski',
            connector: 'bitski',
            img: bitskiLogo,
        },
    ];

    return (
        <Modal 
            show={true} 
            onHide={() => confirm(false)} 
            dialogClassName="connect-modal" 
            centered
        >
            <Modal.Header>
                <h3>{t('Connect Your Wallet')}</h3>
            </Modal.Header>
            <Modal.Body>
                <p>{t('Please connect your wallet to your REVV Time Trial account.')}</p>
                <div>{t('E-mail registration required')}</div>
                {walletsAvailable.filter(wallet => !wallet.extension).map(wallet => {
                    return <BtnWalletConnect wallet={wallet} key={wallet.name} handleConnect={handleConnect}/>
                })}
                <div>{t('Browser extension required')}</div>
                {walletsAvailable.filter(wallet => wallet.extension).map(wallet => {
                    if(wallet.installUrl) {
                        return <ReactGA.OutboundLink key={wallet.name} eventLabel="Connect" to={wallet.installUrl} target="_blank">
                            <div key={wallet.connector} className="btn-connect-wallet">
                                <img src={wallet.img} className={`wallet-img ${wallet.connector}-logo`}/>
                            </div>
                        </ReactGA.OutboundLink>
                    } else {
                        return <BtnWalletConnect wallet={wallet} key={wallet.name} handleConnect={handleConnect}/>
                    }
                })}
            </Modal.Body>
        </Modal>
    )
}

function BtnWalletConnect(props) {
    let {wallet, handleConnect} = props

    return (<div key={wallet.connector} className="btn-connect-wallet" onClick={() => handleConnect(wallet.connector)}>
        <img src={wallet.img} className={`wallet-img ${wallet.connector}-logo`}/>
    </div>)
}

function ConnectButton(props) {
    const history = useHistory();
    const {connect} = useContext(Web3Context);
    const {login} = useContext(AuthContext);

    const handleConnect = async () => {
        const connector = await customConfirm(ConnectModal)

        if (!connector) {
            return;
        }

        const {web3, selectedAccount, walletProvider} = await connect({connector});
        try {
            await login(async () => {
                const message = "Wallet authentication.";
                const signature = await web3.eth.personal.sign(message, selectedAccount, undefined);
                const user = await verifyAddress(selectedAccount, message, signature, walletProvider);
                if(walletProvider) {
                    user.walletProvider = walletProvider;
                }
                return user;
            });
        } catch (e) {
            if(e.subType == "REGISTRATION_REQUIRED") {
                // redirect to connect page if user connects with an unregistered wallet
                history.push('/connect', {registration: true, selectedAccount})
            }
        }
    }

    return <Button onClick={handleConnect} {...props}>{props.children}</Button>
}

export {ConnectModal, ConnectButton}