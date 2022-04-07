import React, { useState , useContext, useEffect } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { profanityCheck, resendEmailVerification, updateUserProfile } from '../../services/httpService';
import { useTranslation } from 'react-i18next';
import { AuthContext, MenuContext } from '../../components/Context';
import './ProfileInfoBox.scss';

function ProfileInfoBox(props) {

    const {user, refreshUser, setUser } = useContext(AuthContext);
    const {showError} = useContext(MenuContext);

    // const [values, setValues] = useState({nickname: user.nickname});
    const [nickname, setNickname] = useState(user.nickname)

    const [userUpdated, setUserUpdated] = useState(false);

    const [t, i18n] = useTranslation();

    function handleChange(e) {
        const {name, value} = e.target;

        // setValues({...values, [name]: value});
        setNickname(value)
    }

    useEffect(() => {
        (async () => {
            await refreshUser();
            setUserUpdated(true);
        })();
    }, []);

    async function saveNicknameUpdate() {
        try {
            const pCheckRes = await profanityCheck(nickname);
            await updateUserProfile(nickname);
            setUser({...user, nickname})
        } catch (e) {
            // deal with the error from profanity, check the error type and subtype;
            showError(e)
        }
    }

    return (
        <div className="profile-info-container">
            <Card className="profile-info-box">
                <Card.Body className="profile-info-box-body">
                    <Row>
                        <Col lg="3">
                            <FontAwesomeIcon icon={faUserAlt} className="profile-info-user-icon"/>
                        </Col>
                        <Col lg="9">
                            <Row>
                                <div className="profile-info-body-content text-left">
                                    <h4><b>{t('Wallet Address')}</b></h4>
                                    <p className="wallet-address-box">{(userUpdated) ? user.web3WalletAddress : ""}</p>
                                </div>
                            </Row> 
                            <Row className="profile-info-input-section">
                                <Col lg="6" className="no-padding">
                                    <Form.Group className="profile-info-group-input">
                                        <Form.Label className="profile-info-input-label"><h4><b>{t('Email')}</b></h4></Form.Label>
                                        <Form.Control disabled className="profile-info-input" type="text" placeholder={(userUpdated) ? user.email : ""} />
                                        {/* #region EMAIL_VERIFICATION
                                        { (user.emailVerified && userUpdated) ? "" : <small className="not-verified-tag">{t('Not Verified Yet')}</small> } */}
                                    </Form.Group>
                                </Col>
                                <Col lg="6" className="no-padding">
                                    <Form.Group className="profile-info-group-input">
                                        <Form.Label className="profile-info-input-label"><h4><b>{t('Nickname')}</b></h4></Form.Label>
                                        <Form.Control value={nickname} onChange={handleChange} name="nickname" className="profile-info-input" type="text" placeholder={(userUpdated) ? user.nickname : ""} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            {/* #region EMAIL_VERIFICATION
            <div className="buttons-control-section">
                {(user.emailVerified && userUpdated) ? "" : <Button variant="revv-secondary" onClick={resendEmailVerification}>{t('Resend verification email')}</Button>}  
                <Button variant="revv" onClick={saveNicknameUpdate}>{t('Save')}</Button>
            </div> */}
        </div>
    );
}

export {ProfileInfoBox};