import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import './Modals.scss';

function DisconnectModal({confirm, ...props}) {
    const [t] = useTranslation();

    return (
        <Modal show={true} dialogClassName="disconnect-modal" centered>
            <Modal.Header>
                <h4>{t("Disconnect your wallet?")}</h4>
            </Modal.Header>
            <Modal.Footer>
                <Button variant="revv-secondary" onClick={() => confirm(false)}>{t('Cancel')}</Button>
                <Button variant="revv" onClick={() => confirm(true)} >{t('OK')}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export {DisconnectModal};