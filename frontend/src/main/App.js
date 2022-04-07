import React, {Component, lazy, Suspense} from 'react';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {ScrollToTop, ProtectedRoute} from '../components/helper';
import {Web3Provider} from '../web3';
import {AuthProvider, MenuProvider, StorageProvider, SeasonProvider} from '../components/Context';
import { Navigation, Misc, NetworkAlert } from '../components';
import dotenv from 'dotenv';

const Connect = lazy(() => import('./routes/Connect'));
const Workshop = lazy(() => import('./routes/Workshop'));
const TimeTrial = lazy(() => import('./routes/TimeTrial'));
const Profile = lazy(() => import('./routes/Profile'));

dotenv.config({ debug: true });

function RedirectionToTT(props) {
  return(
    <Redirect to="/timetrial"/>
  )
}
class App extends Component {
  render = () => {
    return (
      <div className="App">
        <CookiesProvider>
        <AuthProvider>
          <Web3Provider>
            <MenuProvider>
            <StorageProvider>
            <Router>
            <SeasonProvider>
                <ScrollToTop />
                <Misc />
                <Navigation />
                <NetworkAlert />
                <div className="page-wrapper-content">
                  <Suspense fallback={<div>Loading...</div>}>
                  <Switch>
                    <Route exact path="/" component={RedirectionToTT} />
                    <ProtectedRoute path="/profile" component={Profile} />
                    <Route path="/connect" component={Connect}/>
                    <Route path='/timetrial' component={TimeTrial}/>
                    <Route path='/workshop' component={Workshop}/>
                  </Switch>
                  </Suspense>
                </div>
            </SeasonProvider>
            </Router>
            </StorageProvider>
            </MenuProvider>
          </Web3Provider>
        </AuthProvider>
        </CookiesProvider>
      </div>
    )
    ;
  }
}
export default App;
