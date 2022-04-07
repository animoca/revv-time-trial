import React, { useState, useEffect } from 'react';
import {useCookies} from 'react-cookie';

const MenuContext = React.createContext();
const MenuConsumer = MenuContext.Consumer;

const MenuProvider = (props) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [crateData, setCrateData] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showGlobalErrorModal, setShowGlobalErrorModal] = useState(false);
    const [globalErrorMsg, setGlobalErrorMsg] = useState('');
    const [cookies, setCookie, removeCookie] = useCookies(["menuContext"]);
    const [hideTutorial, setHideTutorial] = useState(false);

    function showError(e) {
      setGlobalErrorMsg(e)
      setShowGlobalErrorModal(true);
    }

    useEffect(() => {
      if(cookies["stakePanel"]) {
        setIsCollapsed(cookies["stakePanel"] === "true")
      } else {
        setIsCollapsed(false)
      }

      if(cookies["showTutorial"]) {
        setHideTutorial(cookies["showTutorial"] === "true")
      } else {
        setHideTutorial(false)
      }
    }, [cookies])

    const toggleStakePanel = (val) => {
      setIsCollapsed(val)
      setCookie("stakePanel", val, {maxAge: 86400, path: '/'})
    }

    const toggleHideTutorial = (val) => {
      setHideTutorial(val)
      setCookie("showTutorial", val, {maxAge: 86400, path: '/'})
    }

    return (<MenuContext.Provider
        value={{
          setShowUserMenu,
          showUserMenu,
          crateData,
          setCrateData,
          isCollapsed,
          setIsCollapsed,
          toggleStakePanel,
          showGlobalErrorModal,
          setShowGlobalErrorModal,
          showError,
          globalErrorMsg,
          hideTutorial,
          toggleHideTutorial
        }}
      >
        {props.children}
      </MenuContext.Provider>);    
}


export { MenuContext, MenuProvider, MenuConsumer };