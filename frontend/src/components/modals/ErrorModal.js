import React, {useContext} from 'react';
import {Modal, Button} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {MenuContext} from '../Context';

import './Modals.scss';

function ErrorModal() {
    const [t] = useTranslation();
    const {showGlobalErrorModal, setShowGlobalErrorModal, globalErrorMsg} = useContext(MenuContext);

    return (
        <Modal show={showGlobalErrorModal} onHide={() => setShowGlobalErrorModal(false)} dialogClassName="global-error-modal" centered>
            <Modal.Header closeButton>
                <h4>{t("Sorry. Something went wrong.")}</h4>
            </Modal.Header>
            <Modal.Body>
                <p>{globalErrorMsg ? globalErrorMsg : t('It appears something went wrong with your transaction. Please let us know in Discord.')}</p>
                <img src="" />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setShowGlobalErrorModal(false)} variant="revv-secondary">OK</Button>
            </Modal.Footer>
        </Modal>
    );
}

export {ErrorModal};