import React from 'react'
import { Route, Redirect, useLocation } from 'react-router-dom'
import { AuthConsumer } from '../Context'

const ProtectedRoute = ({ component: Component,location, ...rest }) => (
  <AuthConsumer> 
  { ({user, initialUserLoaded}) => {
    const RedirectCom = (props) => {
      // if we have not finished the initial request to get user
      // hold off on redirecting, e.g on a page refresh
      return (initialUserLoaded) ? <Redirect {...props} /> : <div />
    };
    return (<Route {...rest} render={ props =>
      user ? <Component {...props} {...rest} />  : <RedirectCom to={{pathname:"/connect",state:{from:location}}}/>
    }/>);
    }
  }
  </AuthConsumer>
)

export default ProtectedRoute;