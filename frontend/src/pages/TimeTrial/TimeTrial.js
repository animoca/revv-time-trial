import React, {useContext} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import {ProtectedRoute} from '../../components/helper';
import {PageNotFound} from '../../components';
import {TimeTrialProvider, WorkshopProvider, SeasonContext} from '../../components/Context';
import {Overview} from './Overview';
import {Loadout} from './Loadout';
import {RacePage} from './RacePage';
import './scss/TimeTrial.scss';

function TimeTrial(props) {
  const { currentSeason } = useContext(SeasonContext);

  return (
    <div id="timetrial-wrapper">
      <WorkshopProvider>
      <TimeTrialProvider>
        <Switch>
          <Route exact path={props.match.path} render={(props) => (<Redirect {...props} to={`${props.match.path}/${currentSeason}`} />)} />
          <Route exact path={`${props.match.path}/:season(2019|2020)`} component={Overview} />
          <ProtectedRoute exact path={`${props.match.path}/:season(2019|2020)/loadout`} component={Loadout} />
          <ProtectedRoute exact path={`${props.match.path}/:season(2019|2020)/race`} component={RacePage} />
          <Route path="*" component={PageNotFound} />
        </Switch>
      </TimeTrialProvider>
      </WorkshopProvider>
    </div>
  )
}

export {TimeTrial};