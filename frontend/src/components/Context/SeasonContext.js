import React, { useState, useEffect } from 'react';
import {useLocation} from 'react-router-dom';
import {useCookies} from 'react-cookie';

const SeasonContext = React.createContext();
const SeasonConsumer = SeasonContext.Consumer;

const SeasonProvider = (props) => {
    const SESSION_STORAGE_FIELD_SEASON = "season";
    const [cookies, setCookie] = useCookies(["seasonContext"]);
    const location = useLocation();
    const [currentSeason, _setCurrentSeason] = useState(() => {
        if (cookies[SESSION_STORAGE_FIELD_SEASON]) {
            if (cookies[SESSION_STORAGE_FIELD_SEASON] === "2020" || cookies[SESSION_STORAGE_FIELD_SEASON] === "2019") {
                return cookies[SESSION_STORAGE_FIELD_SEASON];
            }
        }        
        return "2020";
    });

    //Make sure the season is in the correct format
    const setCurrentSeason = (season) => {
        if (season === "2019" || season === "2020") {
            _setCurrentSeason(season);
        }
        else {
            _setCurrentSeason("2020");
        }
    }

    useEffect(() => {
        //set a session cookie
        setCookie(SESSION_STORAGE_FIELD_SEASON, currentSeason, {path: '/'});
    }, [currentSeason]);

    useEffect(() => {
        const is2019 = location.pathname.includes('2019');
        const is2020 = location.pathname.includes('2020');
        const isGP = location.pathname.includes('qualifying');
        const redirecting = location.pathname.includes('connect');

        if(isGP || redirecting) {
            // because season is not included in the url, do not change season
        } else {
            if(is2019 && currentSeason !== "2019") {
                setCurrentSeason("2019")
            } else if(is2020 && currentSeason !== "2020") {
                setCurrentSeason("2020");
            } else {
                
            }
        }
    }, [location.pathname]);

    return (<SeasonContext.Provider
        value={{
          currentSeason, setCurrentSeason
        }}
      >
        {props.children}
      </SeasonContext.Provider>);    
}


export { SeasonContext, SeasonProvider, SeasonConsumer };