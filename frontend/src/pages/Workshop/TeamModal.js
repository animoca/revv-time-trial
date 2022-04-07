import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, ListGroup, Tab, InputGroup, FormControl, Form } from 'react-bootstrap';
import { WorkshopContext } from '../../components/Context';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { renameComposition } from '../../services/workshopService';

import './styles/TeamModal.scss';

const DEFAULT_TEAM_LIMIT = 10;

function TeamModal(props) {
    const {show, setShow, selected, changeTeam, season} = props
    const {compNames, setCompNames } = useContext(WorkshopContext)
    const [valid, setValid] = useState(null)
    const [activeTab, setActiveTab] = useState("main")
    const [activeTeam, setActiveTeam] = useState(null)
    const inputEl = useRef(null)
    const [t] = useTranslation()

    useEffect(() => {
        if(inputEl && inputEl.current) inputEl.current.value = getTeamName(activeTeam)
    }, [activeTeam])

    const getTeamName = useCallback((id) => {
        return compNames && compNames[id] ? compNames[id] : ''
    }, [compNames])

    const handleHide = () => {
        setActiveTab('main')
        setValid(null)
        setShow(false)
    }

    const handleTeamClicked = (index) => {
        handleHide()
        changeTeam(index + 1)
    }

    const handleRenameClicked = (index) => {
        setActiveTeam(index)
        setActiveTab('sub')
    }

    const handleSave = (e) => {
        const putData = async () => {
            const value = inputEl.current.value;
            let res = await renameComposition(season, activeTeam, value)
            if(res) {
                setCompNames(Object.assign(compNames, {[activeTeam]:value}))
                setActiveTab('main')
            }
            setValid(null)
        }

        let name = inputEl.current.value
        if(!name || name.length >= 30 || name.match(/[^\w\d ]/i)) {
            // empty, more than 30 char, or not alphanumeric
            setValid('is-invalid')
            e.preventDefault()
            e.stopPropagation()
        } else {
            setValid('is-valid')
            putData()
        }
    }

    const mainTab = <><Modal.Header>
        <h3>Teams</h3>
    </Modal.Header>
    <Modal.Body>
        <div className="btn-wrapper">
            {/* <Button variant="outline-revv"><FontAwesomeIcon icon={faPlus}/>Add Team</Button> */}
            {/* <Button variant="outline-revv" onClick={() => setActiveTab('sub')}><FontAwesomeIcon icon={faPen}/>Rename</Button> */}
        </div>
        <ListGroup className="team-names" variant="flush">

        {Array(DEFAULT_TEAM_LIMIT).fill(0).map((val, index) =>
        <div className="row-wrapper" key={index}>
            <ListGroup.Item
                className="name-row"
                active={Number(selected)-1 === index}
                onClick={handleTeamClicked.bind(null, index)}
                action>
                <span className="team-index">{`Team ${++index}`}</span>
                <span className="t-name">{getTeamName(index)}</span>
            </ListGroup.Item>
            <Button className="rename-btn" variant="outline-revv" onClick={handleRenameClicked.bind(null, index)}><FontAwesomeIcon icon={faPen}/></Button>
        </div>)}
        </ListGroup>
    </Modal.Body></>

    const subTab = <><Modal.Header>
        <h4 onClick={() => {setActiveTab('main'); setValid(null)}}><FontAwesomeIcon icon={faChevronLeft}/>Back to Teams</h4>
    </Modal.Header>
    <Modal.Body>
        <div>{`Team ${activeTeam}`}</div>
        <InputGroup>
            <FormControl className={valid} as='input' type='text' required ref={inputEl} defaultValue={getTeamName(activeTeam)}/>
            <InputGroup.Append>
                <Button variant="outline-secondary" onClick={handleSave}>Save</Button>
            </InputGroup.Append>
            <FormControl.Feedback type="invalid">Invalid Name</FormControl.Feedback>
        </InputGroup>
    </Modal.Body></>

    return <Modal dialogClassName="team-modal" show={show} onHide={handleHide} centered>
        <Tab.Container activeKey={activeTab} onSelect={k => setActiveTab(k)}>
            <Tab.Content>
                <Tab.Pane eventKey="main">{mainTab}</Tab.Pane>
                <Tab.Pane eventKey="sub">{subTab}</Tab.Pane>
            </Tab.Content>
        </Tab.Container>
        <Modal.Footer><Button variant="revv-secondary" onClick={handleHide} block>{t('Close')}</Button></Modal.Footer>
    </Modal>
}

export {TeamModal}