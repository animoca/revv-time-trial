import React, { useEffect, useState, useContext } from 'react';
import { AuthContext, SeasonContext} from '../Context';

import './ShowTries.scss';

function ShowTries(props) {
  const { user } = useContext(AuthContext);
  const { currentSeason } = useContext(SeasonContext);

  const { setTries, updateTries, triesLeftText} = props.data;

  const [startPolling, setStartPolling] = useState(false);

  useEffect(() => {
    var runner, timeout;
    const TIMEOUT = 60000; // a minute;

    let pollTries = async () => {
      let newTries = await updateTries(currentSeason);
      if(newTries && newTries > props.tries) {
        setTries(newTries)
        clearInterval(runner)
        clearTimeout(timeout);
      }
    }

    if(startPolling && user && !isNaN(props.tries)) {
      // start polling with timeout
      runner = setInterval(pollTries, 9000);
      timeout = setTimeout(() => {
        setStartPolling(false)
        clearInterval(runner)
      }, TIMEOUT);
    }


    return () => {
      clearInterval(runner)
      clearTimeout(timeout)
    }
  }, [startPolling])

  useEffect(() => {
    (async () => {
      if (user && updateTries) {
        const response = await updateTries(currentSeason)
          .catch(err => {
            console.error("Could not get profile!")
          });

        if (response || !isNaN(response)) {
          setTries(response)
        }
      }
    })()
  }, [user, currentSeason]);

  return <>
    <div className="tries">
      <div className="tries-count">
        <span className="text">{triesLeftText}</span>
        <span className="count">{props.tries}</span>
      </div>
    </div>
  </>
}

export { ShowTries }
