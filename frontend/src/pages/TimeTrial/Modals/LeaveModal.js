import React from 'react'
import { Modal, Button } from 'react-bootstrap';

function LeaveModal(props) {
    const { show, setShow, redirect } = props

    const handleHide = () => setShow(false)

    return <Modal show={show} onHide={handleHide} dialogClassName="leave-modal" centered>
        <Modal.Header>
            <h4>Leaving Time Trial</h4>
        </Modal.Header>
        <Modal.Body>
            <p>You will be taken to Workshop to edit your teams.</p>
        </Modal.Body>
        <Modal.Footer>
            <div className="btn-wrapper">
                <Button variant="revv-secondary" onClick={handleHide}>Cancel</Button>
                <Button variant="revv" onClick={redirect}>OK</Button>
            </div>
        </Modal.Footer>
    </Modal>
}

export {LeaveModal}