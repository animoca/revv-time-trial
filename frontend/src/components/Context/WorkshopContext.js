import React, { useState, useReducer, useMemo, useEffect, useContext } from 'react';
import { SeasonContext } from '../Context';
import {getItemsAndComposition} from '../../services/workshopService';

const WorkshopContext = React.createContext();
const WorkshopConsumer = WorkshopContext.Consumer;

const WorkshopProvider = (props) => {
  const { currentSeason } = useContext(SeasonContext);
  const [composition, setComposition] = useState({});
  const [compNames, setCompNames] = useState({});
  const [isUpdatingCompItems, setIsUpdatingCompItems] = useState(false);

  const [userItems, dispatchItems] = useReducer(itemsReducer, {});
  function itemsReducer(state, action) {
    switch(action.type) {
        case 'upsert':
          const newSeasonData = {[currentSeason]: action.data}
          return {...state, ...newSeasonData};
        default:
            throw new Error('reducer action not defined.')
    }
  }

  const itemsData = useMemo(() => {
    return userItems[currentSeason] || {};
  }, [currentSeason, userItems])

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async (season, excludeItems) => {
      setIsUpdatingCompItems(true);
      const data = await getItemsAndComposition({season, excludeItems})
      .catch(err => { 
        console.error("Could not get items!", err)
      });
      
      if(data && !cancelled) {
        !excludeItems && dispatchItems({type: 'upsert', data: data.items})
        setComposition(data.composition)
        setCompNames(data.names)
      }
      setIsUpdatingCompItems(false);
    }

    if(!userItems[currentSeason]) {
      fetchItems(currentSeason);
    } else {
      fetchItems(currentSeason, true);
    }

    return () => {cancelled = true;}
  }, [currentSeason])

  return (<WorkshopContext.Provider
      value={{
        itemsData,//kvp uid:data
        isUpdatingCompItems,
        // setItemsData,
        userItems,
        dispatchItems,
        composition,//kvp uid:teamIndex
        setComposition,
        compNames,//kvp: compId:compName
        setCompNames
      }}
    >
      {props.children}
    </WorkshopContext.Provider>);
}


export { WorkshopContext, WorkshopProvider, WorkshopConsumer };