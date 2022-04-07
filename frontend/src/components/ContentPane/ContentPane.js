import React from 'react';
import './ContentPane.css'

function ContentHeader(props) {
    return (
        <fieldset className={`revv-content-header ${props.className ? props.className : ''}`}>
            <legend><h2>{props.children}</h2></legend>
        </fieldset>
    )
}


function ContentPane(props) {
    let {backfill} = props;

    return (
        <div className={`revv-content-pane ${props.className ? props.className : ''}`}>
            <fieldset className="revv-right-shoulder">
                <legend><h3>{props.title}</h3></legend>
                <div className={`content-container d-flex ${backfill ? 'bg-backfill' : ''}`}>
                    {props.children}
                </div>
            </fieldset>
        </div>
    )
}

function ContentPiece(props) {
    return (
        <div className={`revv-content-piece ${props.className ? props.className : ''}`}>
            {props.children}
        </div>
    )
}

export {ContentHeader, ContentPane, ContentPiece}
