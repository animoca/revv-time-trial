import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import { AuthContext, SeasonContext } from '../../components/Context';
import './styles/Workshop.scss';

function Landing(props) {
  const {t, i18n} = useTranslation();

  const {user} = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext);
  const baseUrl = useLocation().pathname.split('/')[1]
  const history = useHistory()
  history.push(`/${baseUrl}/${currentSeason}/1/car`)
  
  return (<></>)
}

export {Landing};