import React, { useContext, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { TimeTrialContext } from '../../components/Context';
import {OverviewTabbedStandings} from './TabbedStandings';
import {TrackOverview,TrackDetails, TrackSummary, MBestTimes, NextTrackPanel, MBStickyBottom} from './Track';
import { TabbedCurrentPool } from './TabbedCurrentPool';
import { SecondaryNavigationTabs } from '../../components';
import {ErrorBoundary} from '../../components/helper';
import './scss/Overview.scss';

function Overview(props) {
  const history = useHistory();
  console.log(history)
  const { season } = useParams();
  const {track, nextTrack, weather} = useContext(TimeTrialContext);

  const tabClickedAction = (season) => {
    history.push(`/timetrial/${season}`)
  }

  return <div id="timetrial" className={`page-wrapper-bg s${season}`}>
    <SecondaryNavigationTabs className="tabbed-current-pool" innerTitlesWrapperClasses="container" contentWrapperClasses="tab-content" defaultTabKey={season}>
      <SecondaryNavigationTabs.Tab tabKey="2020" overrideTabClickedAction={() => tabClickedAction(2020)}>
        <SecondaryNavigationTabs.Tab.Title>
          2020
        </SecondaryNavigationTabs.Tab.Title>
      </SecondaryNavigationTabs.Tab>
      <SecondaryNavigationTabs.Tab tabKey="2019" overrideTabClickedAction={() => tabClickedAction(2019)}>
        <SecondaryNavigationTabs.Tab.Title>
          2019
        </SecondaryNavigationTabs.Tab.Title>
      </SecondaryNavigationTabs.Tab>
    </SecondaryNavigationTabs>

    <ErrorBoundary>
    <div className={`overview`}>
      <TrackOverview data={{track, nextTrack, weather, ...props}}/>
      <TrackDetails data={{track, ...props}}/>
      <div className="mobile-only">
        <TrackSummary data={{track, weather}}/>
        <MBestTimes {...props}/>
        <NextTrackPanel data={{nextTrack}}/>
        <MBStickyBottom {...props} />
      </div>
    </div>
    <OverviewTabbedStandings {...props} allowShowAll />
    </ErrorBoundary>
  </div>
}




export {Overview}