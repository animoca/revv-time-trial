import React from 'react'
import { Modal, Button } from 'react-bootstrap';
// import fin1 from '../img/race-finish-1.jpg';
// import fin2 from '../img/race-finish-2.jpg';
// import fin3 from '../img/race-finish-3.jpg';
import { useTranslation } from 'react-i18next';

// let imgSrcs = [fin1, fin2, fin3];

// function getRandomImg () {
//     let rand = Math.floor(Math.random() * 3);
//     return imgSrcs[rand];
// }

function RaceFinishModal(props) {
    const { t, i18n } = useTranslation();
    const { show, setShow, cb } = props

    const handleHide = () => setShow(false)
    const showRes = () => {
        handleHide()
        cb()
    }

    return <Modal show={show} onHide={handleHide} dialogClassName="finish-modal" centered backdrop="static">
        <Modal.Header>
            <h4>Congratulations! Lap Completed!</h4>
        </Modal.Header>

        <Modal.Footer>
            <div><Button variant="revv" onClick={showRes} block>{t('Lap Time')}</Button></div>
        </Modal.Footer>
    </Modal>
}

export {RaceFinishModal}