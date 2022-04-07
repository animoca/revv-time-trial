import React from 'react';
import { Bitski } from 'bitski';


function BitskiCallback(props) {
  try {
    Bitski.callback();
  } catch(e) {
    console.error("Bitski Callback Error", e);
  }
  
  const { children } = props;
  return (children || (<></>));
}

const BitskiCallbackPath = "/bitski/callback";

export {BitskiCallback, BitskiCallbackPath};