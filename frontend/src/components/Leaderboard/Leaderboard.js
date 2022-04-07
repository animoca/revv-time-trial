import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { Row, Col, Badge, Container } from 'react-bootstrap';
import moment from 'moment';

import { AuthContext } from '../Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import './Leaderboard.scss';

export function LeaderboardRowNew(props) {
    const {rank, nickname, isCurrentUser, score, type, delta, showDelta} = props;
    const [value, setValue] = useState('-');

    useEffect(() => {
        if(type === "time") {
            setValue(moment(new Date(score)).format('mm:ss.SSS'))
        } else {
            setValue(score || 0)
        }
    }, [type, score])

    return <Row className={`lb-row ${isCurrentUser ? 'highlight' : ''}`}>
        <Col xs={2} md={2} className="rank"><div className="rank-badge"><b>{rank}</b></div></Col>
        <Col xs={5} md={5} lg={7} className={`nickname ${showDelta ? 'delta' : ''}`}>
            {showDelta
            ? <span className={`rank-delta ${delta > 0 ? 'drop' : 'rise'}`}>
                <FontAwesomeIcon icon={delta > 0 ? faCaretDown : faCaretUp} /> {(isNaN(delta) || delta == 0) ? '-' : Math.abs(delta)}
            </span>
            : <></>}
            <span className="nick">{nickname}</span>
        </Col>
        <Col xs={5} md={5} lg={3} className="value"><Badge pill>{value}</Badge></Col>
    </Row>
}

export function LeaderboardNew(props) {
    const {fetchLeaderboard, formatRows} = props;
    const {user, initialUserLoaded} = useContext(AuthContext);
    const [rowsData, setRowsData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        var cancel = false;
        const fetchBoard = async () => {
            try {
                setLoading(true);
                const res = await fetchLeaderboard();
                
                // take a transformation function as props
                const processed = formatRows
                ? res.map(formatRows)
                : res.map(entry => {
                    return {
                        ...entry, 
                        score: entry.time || entry.score,
                        isCurrentUser: user ? entry.walletAddress.toLowerCase() === user.walletAddress.toLowerCase() : false
                    }
                })
                
                !cancel && setRowsData(processed)
                !cancel && setLoading(false);
                // console.log(processed)
            } catch(e) {
                console.error(e)
                setLoading(false);
            }
        }
        if(initialUserLoaded && fetchLeaderboard) fetchBoard()

        return () => cancel = true;
    }, [initialUserLoaded, fetchLeaderboard])

    return <div className="leaderboard">
        <div className="leaderboard-header">
            {props.children}
        </div>
        <div className="heading">
            <p>Standing</p>
            <p>{props.type === "time" ? "Best Results" : "Total Score"}</p>
        </div>
        {loading ? 'Loading Data...' : ''}
        <Container className="rows-container">
            {!loading && rowsData.length ? rowsData.map((entry, id) => {
                return <LeaderboardRowNew key={id} {...entry} {...props} />
            }) : <></>}
            {!loading && !rowsData.length && 'No Entries'}
        </Container>
    </div>
}
