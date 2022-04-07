import React, { useState, useContext } from 'react';
import { AuthContext, MenuContext } from '../Context';
import { Web3Context } from '../../web3';
import { Nav, Container, Collapse, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { customConfirm } from '../helper/useConfirm';
import { DisconnectModal } from '../modals';


function SecondaryNavigation(props) {
    const { t } = useTranslation();
    const authContext = useContext(AuthContext);
    const {disconnect} = useContext(Web3Context);
    const {className} = props;

    let navClass = className + " nav-links"
    
    const {user, logout} = authContext;

    const handleLogout = async () => {
        let conf = await customConfirm(DisconnectModal, {});

        if(conf) {
            try {
                await disconnect();
            } catch(e) {
                
            }
            logout();
        }
    }
    
    return (
        user ? (
			<Nav id="second-nav" className={navClass}>
                <Container id="secondary-nav-container">
				<SecondaryNavLink to="/profile"><span className="link-text">{t('Profile')}</span></SecondaryNavLink>
                {/* <SecondaryNavLink to="/staking"><span className="link-text">{t('Staking')}</span></SecondaryNavLink> */}
				<div className="keep-right desktop-only"><Button variant="revv-light" className="profile-logout-btn" onClick={handleLogout}>{t('Disconnect')}</Button></div>
                </Container>
            </Nav>
		) : <></>
    )
}

function SecondaryNavLink(props) {
    const { t } = useTranslation();
    const location = useLocation();
    const {setShowUserMenu}= useContext(MenuContext);
    let comingSoon = <span className="coming-soon">{t('Coming Soon')}</span>
    let active = location.pathname === props.to ? "active " : "";
    let disabled = props.soon ? "disabled " : "";

    return (
        <Link to={props.to} className={active + disabled + "nav-link"} onClick={() => setShowUserMenu(false)}>{props.children} {props.soon ? comingSoon : <></>}</Link>
    )
}

export { SecondaryNavigation };