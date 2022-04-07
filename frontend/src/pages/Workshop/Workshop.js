import React, {useContext} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {Landing} from './Landing'
import {Gallery} from './Gallery'
import {ProtectedRoute} from '../../components/helper';
import { WorkshopProvider } from '../../components/Context';
import {PageNotFound} from '../../components';

function Workshop(props) {
  return (
    <WorkshopProvider>
      <Switch>
        <ProtectedRoute exact path={props.match.path} component={Landing} />
        <ProtectedRoute exact path={`${props.match.path}/:season(2019|2020)/:team/:category`} component={Gallery} />
        <ProtectedRoute exact path={`${props.match.path}/:season(2019|2020)/:team/:category/:subCategory`} component={Gallery} />
        <Route path="*" component={PageNotFound} />
      </Switch>
    </WorkshopProvider>
  )
}

export {Workshop};