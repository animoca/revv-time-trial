import React, {useEffect, useContext} from 'react';
import { ProfileInfoBox } from '../components';
import { SecondaryNavigation } from '../components/Header/'
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ReactGA from "react-ga";
import {Web3Context} from "../web3/";

function Profile(props) {
    // const [t, i18n] = useTranslation();

    useEffect(() => {
        ReactGA.pageview(props.location.pathname);
    }, []);

    return (
        <>
            <SecondaryNavigation className="desktop-only" />
            <Container>
                <ProfileInfoBox />
            </Container>
        </>
    )
}

export {Profile};