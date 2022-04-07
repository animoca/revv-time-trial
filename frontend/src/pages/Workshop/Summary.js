import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {useParams} from 'react-router-dom';
import { Col } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import {CompositionItemTile} from './ItemTile'
import {getSubTypesInCategory} from './Helper'
import {unequipItem, getCompositionById} from '../../services/workshopService'
import './styles/Summary.scss';


function Summary(props) {
  const [t] = useTranslation();
  const [items, setItems] = useState([]);

  const {composition, setComposition} = useContext(WorkshopContext)
  const {season, team, category} = useParams();
  
  const unequip = async (tokenId) =>{
    const result = await unequipItem(season, tokenId)
    if(result)
      setComposition(result)
  }
  const types = getSubTypesInCategory(category)

  useEffect(() => {
    const fetchComp = async () => {
      const compo = await getCompositionById(season, team);

      if(compo) {
        const comp = []
        .concat(category === "car" ? compo.parts : compo.gear)
        .filter(x => x) // filter out undefined in case parts/gear is not set
        .map(x => {return {...x, type: x.type.toLowerCase().replace(/[\s]+/g, '') }})
        
        setItems(comp);
      } else {
        setItems([]);
      }
    }

    if(team && category) fetchComp();
  }, [team, category, season, composition])
  
  
  const nfts = types.map((type,index) => {
    const item = items.filter(x => x.type === type)
    return <CompositionItemTile key={index} data={{
      item:item.length?item[0].tokenId:null,type,unequip}}/>
  })

  
    return <Col id="composition-summary">
      <div className = "composition-summary">
        <div className = "top">{t("Composition Summary")}</div>
        <div className = "contents" id={category}>{nfts}</div>
      </div>
    </Col>
}

export {Summary};