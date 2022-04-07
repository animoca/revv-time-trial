import React, {useState} from 'react';
import { Modal } from 'react-bootstrap';
import './Dialogs.scss';
import { useTranslation } from 'react-i18next';
import checkIcon from '../../assets/img/verify-success-check-icon.svg';

function AddressVerifiedModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const [t] = useTranslation();

    return(
        <Modal show={show} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>{t('Email Verified Successfully')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{t('Your profile is now complete.')}</p>
                <div className="check-icon text-center">
                    <img src={checkIcon} alt="Your profile is now complete." />
                </div>
                <button className="btn-enter">{t('OK')}</button>
            </Modal.Body>
        </Modal>
    );
}

export default AddressVerifiedModal