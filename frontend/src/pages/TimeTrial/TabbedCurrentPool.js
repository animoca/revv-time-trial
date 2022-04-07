import React, { useContext, useEffect, useState } from 'react';
import {getWeeklyRewards} from '../../services/timeTrialService';
import { SeasonContext } from '../../components/Context';
import revIco from '../../assets/images/icon-revv.svg';
import revIcoInversed from '../../assets/images/icon-revv-inversed.svg';
import './scss/TabbedCurrentPool.scss';

function TabbedCurrentPool(props) {
  const { currentSeason } = useContext(SeasonContext);
  const [ seasonToRevvMap, setSeasonToRevvMap] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
        const seasonToRevvMapToSet = {};
        const res2019 = await getWeeklyRewards(2019);
        if (res2019) {
            seasonToRevvMapToSet[2019] = res2019.revv;
        }

        const res2020 = await getWeeklyRewards(2020);
        if (res2020) {
            seasonToRevvMapToSet[2020] = res2020.revv;
        }

        setSeasonToRevvMap(seasonToRevvMapToSet);
    }

    fetchData()
  }, [])

  const is2020 = currentSeason === "2020";
  
  return ( seasonToRevvMap &&
    <div className="wrapper">
      {/* <div className="label">Current Pool</div>
      <div className="current-pool">
        <div className={`season ${ is2020 ? "active" : ""}`}>
          <div className="pool-content">
            <img className="revv-img" src={is2020 ? revIco : revIcoInversed} />
            <span>{seasonToRevvMap[2020]}</span>
          </div>
        </div>
        <div className={`season ${ !is2020 ? "active" : ""}`}>
          <div className="pool-content">
            <img className="revv-img" src={!is2020 ? revIco : revIcoInversed} />
            <span>{seasonToRevvMap[2019]}</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export {TabbedCurrentPool}