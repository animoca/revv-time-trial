import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';

const mount = document.createElement("div")
document.querySelector("body").appendChild(mount)

export function customConfirm(DialogContent, props) {
    return new Promise(res => {
        const confirm = answer => {
            res(answer)
            unmountComponentAtNode(mount)
        }

        render(<DialogContent confirm={confirm} {...props} />, mount)
    })
}

export function customPending(DialogContent, prom, props) {
    return new Promise((resolve, reject) => {
        let res = () => {
            return prom().then(res => resolve(res))
            .catch(err => reject(err))
            .finally(_ => unmountComponentAtNode(mount))
        }

        render(<DialogContent prom={res} {...props} />, mount)
    })
}