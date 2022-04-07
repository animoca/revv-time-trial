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
                {/* { index === 0 && <img src={require('../img/tutorial/TimeTriaTutorialImagesB_01.jpg')} /> }
                { index === 1 && <img src={require('../img/tutorial/TimeTriaTutorialImagesB_02.jpg')} /> }
                { index === 2 && <img src={require('../img/tutorial/TimeTriaTutorialImagesB_03.jpg')} /> }
                { index === 3 && <img src={require('../img/tutorial/TimeTriaTutorialImagesB_04.jpg')} /> } */}
            </div>

            <ol className="slide-indicators carousel-indicators">
                {new Array(TOTAL_TUTORIAL_SLIDES).fill(0).map((x, i) => {
                    return <li key={i} className={index === i ? 'active': ''}></li>
                })}
            </ol>

            <div>
                { index === 0 && <div><h4>Welcome to REVV Time Trial!</h4><p>The Time Trial is where players can take their cars, drivers and collection of gear and components, and shape them into a champion.</p></div> }
                { index === 1 && <div><h4>Earn REVV and special items!</h4><p>At the end of the week, the best performers will be ranked, with the those at the top of the Leaderboard receiving rewards</p></div> }
                { index === 2 && <div><h4>Choose tyres depends on the track type and weather</h4><p>Each day, a new track is presented to the players that will require the right type of composition and tyre selection, with the aim of getting the fastest possible lap.</p></div> }
                { index === 3 && <div><h4>Choose your team and equip it in TimeTrial</h4><p>You can compose your best car and driver in Workshop and equip them in TimeTrial. According to the weather condition and track character, you have to judge what attributes matter.</p></div> }
            </div>

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