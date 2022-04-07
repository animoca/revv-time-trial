import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import { LoadoutAttributePane } from './LoadoutAttributePane'
import { getRarityString, getRarityStringCapitalized, capitalize } from './Helper'
import { getFullMetadata } from '@animoca/f1dt-core_metadata/src/utils';
import './styles/BottomPane.scss';


function BottomPane(props) {
  const [t] = useTranslation();

  const { itemsData, compNames } = useContext(WorkshopContext)
  const { selection, equipped, categoryMainItem } = props.data;
  const { team, category, subCategory } = useParams();

  const [itemMetadata, setItemMetadata] = useState(null);

  const id = (selection||equipped)?"mobile-hidden":null;

  useEffect(() => {
    let item
    if (!subCategory && categoryMainItem) item = categoryMainItem
    if (subCategory == "select" && selection) item = selection
    if (item) {
      const response = getFullMetadata(item)
      setItemMetadata(response)
    }
  }, [selection, categoryMainItem])

  const getCompositionName = (id) => {
    return compNames && compNames[id] ? compNames[id] : "Team" + " " + Number(id)
  }

  let title = getCompositionName(team) + " " + t(capitalize(category))
  if (!subCategory && categoryMainItem ||
    subCategory == "select" && selection)
    title = <>{itemMetadata ? itemMetadata.name : <Spinner animation="border" variant="light" size="sm" />}</>

  let details;
  if (!subCategory && categoryMainItem && itemsData[categoryMainItem])
    details = <div className="details">
      {t("Season")} <span className="season">{itemsData[categoryMainItem].season}</span>
      <span className="rarity" id={getRarityString(itemsData[categoryMainItem].rarity)}>{t(getRarityStringCapitalized(itemsData[categoryMainItem].rarity))}</span>
    </div>

  return <div className="bottom-pane" id={id}>
    <div className="top">
      <div className="content">
        <div className="title">{title}</div>
        {details}
      </div>
    </div>
    <div className="dials">

      <LoadoutAttributePane data={{ selection, equipped }} /></div>
  </div>
}

export { BottomPane };