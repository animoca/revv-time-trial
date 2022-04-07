import React, { useState, useEffect } from 'react'

const StorageContext = React.createContext();
const StorageConsumer = StorageContext.Consumer;

const StorageProvider = (props) => {
    
    const [crateItems, setCrateItems] = useState(null);
    const [cratesData, setCratesData] = useState({});
    const [keysData, setKeysData] = useState({});
    const [totalPurchased, setTotalPurchased] = useState([0,0,0,0]);
    const [selected, setSelected] = useState("legendary");
    const [unitPrice, setUnitPrice] = useState([500, 150, 40, 20]);
    const [auctionUrl, setAuctionUrl] = useState(null);
    const [trackSaleStarted, setTrackSaleStarted] = useState(null);


    const versionPrefix = 'v1'

    useEffect(() => {
      try {
        const cratesDataJson = window.localStorage.getItem(`${versionPrefix}crates2019Data`);
        if(cratesDataJson != null) {
          setCratesData(JSON.parse(cratesDataJson));
        }

        const keysDataJson = window.localStorage.getItem(`${versionPrefix}keysData`);
        if(keysDataJson != null) {
          setKeysData(JSON.parse(keysDataJson));
        }

        const totalPurchasedJson = window.localStorage.getItem(`${versionPrefix}totalPurchased`);
        if(totalPurchasedJson != null) {
          setTotalPurchased(JSON.parse(totalPurchasedJson));
        }

        const unitPriceJson = window.localStorage.getItem(`${versionPrefix}unitPrice`);
        if(unitPriceJson != null) {
          setUnitPrice(JSON.parse(unitPriceJson));
        }

        const auctionUrl = window.localStorage.getItem(`${versionPrefix}auctionUrl`);
        if(auctionUrl != null) {
          setAuctionUrl(auctionUrl);
        }
        const trackSaleStarted = window.localStorage.getItem(`${versionPrefix}trackSaleV2Started`);
        if(trackSaleStarted != null) {
          setTrackSaleStarted(JSON.parse(trackSaleStarted));
        }
      } catch (e) {
        console.warn("LocalStorage is not supported", e);
      }
      
    }, []);

    useEffect(() => {
      try {
        if(cratesData != null) {
          window.localStorage.setItem(`${versionPrefix}crates2019Data`, JSON.stringify(cratesData));
        }
        if(keysData != null) {
          window.localStorage.setItem(`${versionPrefix}keysData`, JSON.stringify(keysData));
        }
        if(totalPurchased) {
          window.localStorage.setItem(`${versionPrefix}totalPurchased`, JSON.stringify(totalPurchased));
        }
        if(unitPrice) {
          window.localStorage.setItem(`${versionPrefix}unitPrice`, JSON.stringify(unitPrice));
        }
        if (auctionUrl) {
          window.localStorage.setItem(`${versionPrefix}auctionUrl`, auctionUrl);
        }
        if (trackSaleStarted != null) {
          window.localStorage.setItem(`${versionPrefix}trackSaleV2Started`, trackSaleStarted);
        }
      } catch (e) {
        console.warn("LocalStorage is not supported", e);
      }
    }, [totalPurchased, cratesData, unitPrice, auctionUrl, keysData, trackSaleStarted]);
    
    return (<StorageContext.Provider
        value={{
          crateItems,
          setCrateItems,
          cratesData,
          setCratesData,
          keysData,
          setKeysData,
          totalPurchased,
          setTotalPurchased,
          selected,
          setSelected,
          unitPrice,
          setUnitPrice,
          auctionUrl,
          setAuctionUrl,
          trackSaleStarted,
          setTrackSaleStarted
        }}
      >
        {props.children}
      </StorageContext.Provider>);    
}


export { StorageContext, StorageProvider, StorageConsumer };