import React, { useState } from 'react'
import { Modal, Button, Pagination } from 'react-bootstrap';

const TOTAL_TUTORIAL_SLIDES = 4;

function TutorialModals(props) {
    const { show, setShow } = props;
    const handleHide = () => setShow(false);
    const [index, setIndex] = useState(0);

    const handlePaginate = (increment) => {
        increment = Number(increment) || 1;

        // Math.clamp when
        setIndex(Math.max(0, Math.min(index + increment, TOTAL_TUTORIAL_SLIDES - 1)))
    }

    return <Modal show={show} onHide={handleHide} dialogClassName="tutorial-modal" centered>
        <Modal.Body className="tutorial-slides">
            <div className="tutorial-switch">
                { index === 0 && <img src={require('../img/race-finish-1.jpg')} /> }
                { index === 1 && <img src={require('../img/race-finish-2.jpg')} /> }
                { index === 2 && <img src={require('../img/race-finish-3.jpg')} /> }
                { index === 3 && <img src={require('../img/race-finish-1.jpg')} /> }
            </div>

            <ol className="slide-indicators carousel-indicators">
                {new Array(TOTAL_TUTORIAL_SLIDES).fill(0).map((x, i) => {
                    return <li key={i} className={index === i ? 'active': ''}></li>
                })}
            </ol>

            <Pagination>
                {index === 0
                ? <></>
                : <Pagination.Prev onClick={() => handlePaginate(-1)}>{"<<"} BACK</Pagination.Prev>}

                {index === 3
                ? <Pagination.Item onClick={() => setShow(false)}>{'GOT IT'}</Pagination.Item>
                : <Pagination.Next onClick={() => handlePaginate(1)}>NEXT {">>"}</Pagination.Next>}
            </Pagination>
        </Modal.Body>
    </Modal>
}

export {TutorialModals}