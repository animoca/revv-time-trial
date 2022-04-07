import React, { useState, useEffect } from 'react';
import { Accordion, Card, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

function AccordionContent(props){

    const [ isOpen, setOpen ] = useState(false);

    const { title, id, description, currentActiveKey, handleClick } = props 

    const { t } = useTranslation();

    useEffect(() => {
        if (currentActiveKey === id) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    })

    const accordionHandleClick = (id) => {
        if (isOpen) {
            handleClick(0)
        } else {
            handleClick(id)
        }
    }

    return(
        <Card>
            <Accordion.Toggle as={Card.Header} eventKey={id} className={ isOpen ? "accordion-open" : "" } onClick={() => accordionHandleClick(id)}>
                {title} { isOpen ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} /> }
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={id}>
                <Card.Body>
                    { description.map((desc, key) => <p key={key}>{desc}</p>) }
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );

}

export {AccordionContent};
