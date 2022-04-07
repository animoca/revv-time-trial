import React, {useState, useContext, useEffect} from 'react';
import {AuthContext, MenuContext} from '../Context';
import {useTranslation} from 'react-i18next';

import {Navbar, Nav, Button} from 'react-bootstrap';
import {Link, useLocation, useHistory} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLink, faUser} from '@fortawesome/free-solid-svg-icons';
import {SecondaryNavigation} from './SecondaryNavigation'
import {Web3Context} from '../../web3';
import './Nav.scss'

function formatCurrency(value) {
    if(isNaN(value)) return 0;
  
    const formatter = new Intl.NumberFormat();
    return formatter.format(value)
}

function Navigation(props) {
    const {t} = useTranslation()
    const history = useHistory()
    const {user, logout} = useContext(AuthContext)
    const {showUserMenu, setShowUserMenu}= useContext(MenuContext);
    const {disconnect} = useContext(Web3Context);

    const handleLogoutClicked = async () => {
        setShowUserMenu(false)
        try {
            await disconnect()
        } catch(e) {

        }
        logout()
    }
    
    const handleProfileBtnClicked = () => {
        setShowUserMenu(false)
        history.push(user ? '/profile' : '/connect')
    }

    const connectBtn = (<Button className="connect" variant="revv" onClick={handleProfileBtnClicked}>{t('Connect to')}<br /><span className="smaller-font">{t('access your REVV')}</span></Button>)
    const disconnectBtn = <Button variant="revv-light" onClick={handleLogoutClicked}>{t('Disconnect')}</Button>


    return (
        <Navbar id="main-nav" variant="dark" expand="xl" expanded={showUserMenu} collapseOnSelect onToggle={setShowUserMenu} className="sticky-top">
                <Navbar.Toggle className="nav-toggle" aria-controls="navbar-menu" />
                <Navbar.Collapse id="navbar-menu">
                    <Nav className="nav-links">
                        <NavLink to="/workshop"><span className="link-text">{t('Workshop')}</span></NavLink>
                        <NavLink to="/timetrial"><span className="link-text">{t('Time Trial')}</span></NavLink>
                    </Nav>
                    <div id="second-nav-wrapper" className="mobile-only"><SecondaryNavigation /></div>
                    <Nav className="mobile-only">{user ? disconnectBtn : connectBtn}</Nav>
                </Navbar.Collapse>
                <Nav id="nav-right">
                    {user ? <Button className="icon" variant="revv connected" size="sm" onClick={handleProfileBtnClicked}>
                        <FontAwesomeIcon icon={faUser} />
                        <span className="desktop-only">{user.nickname}</span>
                    </Button>
                    : <Button className="icon connect" variant="revv" size="sm" onClick={handleProfileBtnClicked}>
                    <FontAwesomeIcon icon={faLink} />
                    <span className="desktop-only">Connect<br/><span className="smaller-font">access your REVV</span></span>
                    </Button>}
                    
                </Nav>
        </Navbar>)
}

function NavLink({to, promote, beta, soon, children}) {
    const { t } = useTranslation();
    const location = useLocation();
    const [navClass, setNavClass] = useState("nav-link")
    const {setShowUserMenu}= useContext(MenuContext);
    let newStuff = promote ? <div className="top-label">{t('NEW')}</div> : <></>
    let inBeta = beta ? <div className="top-label">{t('BETA')}</div> : <></>
    let comingSoon = soon ? <div className="coming-soon">{t('Coming Soon')}</div> : <></>

    useEffect(() => {
        const current = location.pathname == to || location.pathname.split('/').includes(to.replace("/", ''))
        setNavClass(`nav-link ${current ? "active " : ""} ${soon ? "disabled " : ""} ${promote ? "promote " : ""} ${beta ? "beta" : ""}`)
    }, [location.pathname])

    return <Link to={to} className={navClass} onClick={() => setShowUserMenu(false)}>
        {newStuff} {comingSoon} {inBeta} {children} 
    </Link>
}

export {Navigation};