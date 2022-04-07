import { Row, Col, Form, Modal, Container, FormCheck } from 'react-bootstrap';
import { ConnectNew, ConnectExisting } from '../fragments/';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect, Link, useLocation, useHistory } from "react-router-dom"
// import { useCookies, Cookies } from 'react-cookie';
import { profanityCheck, register, verifyAddress } from '../services/httpService';
import { Web3Context } from '../web3';
import { AuthContext } from '../components/Context';
import { useTranslation, Trans } from 'react-i18next';
import ReactGA from 'react-ga';

const MAILERLITE_API_KEY = process.env.REACT_APP_MAILERLITE_API_KEY;

function Connect(props) {

    let {t} = useTranslation();
    
    const authContext = useContext(AuthContext);

    // const [cookies, setCookie, removeCookie] = useCookies(['sessionId']);
    const location = useLocation();
    const history = useHistory();

    const {user,login, canForwardToRegister} = authContext;

    const {connect} = useContext(Web3Context);

    const [walletAddress, setWalletAddress] = useState(null);
    
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const [registeredUser, setRegisteredUser] = useState(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [showErrorModal, setShowErrorModal] = useState(false);
    
    useEffect(() => {
        if(registeredUser)  {
            setShowSuccessModal(true);
        }
    }, [registeredUser]);

    useEffect(() => {
        // ReactGA.pageview(props.location.pathname);

        if(location.state && location.state.registration) {
            setWalletAddress(location.state.selectedAccount)
            setShowRegisterModal(true)

            history.replace("/connect")
        }
    }, []);

    useEffect(() => {
        if(showRegisterModal) {
            ReactGA.event({
                category: 'Registration',
                action: 'Show Registration'
            });
        }
    }, [showRegisterModal]);

    useEffect(() => {
        if(showSuccessModal) {
            ReactGA.event({
                category: 'Registration',
                action: 'Registration Success'
            });
        }
    }, [showSuccessModal]);

    useEffect(() => {
        if(showErrorModal) {
            ReactGA.event({
                category: 'Registration',
                action: 'Registration Failed'
            });
        }
    }, [showErrorModal]);

    const message = "Wallet authentication.";

    const loginWithWallet = async (connector) => {
        ReactGA.event({
            category: 'Connect',
            action: connector
        });
        try {
            setShowRegisterModal(false);
            await login(async () => {
                const {web3, selectedAccount, walletProvider} = await connect({connector});
                const signature = await web3.eth.personal.sign(message, selectedAccount, undefined);
                setWalletAddress(selectedAccount);
                const user = await verifyAddress(selectedAccount, message, signature, walletProvider);
                if(walletProvider) {
                    user.walletProvider = walletProvider;
                }

                return user;
            });
        } catch (e) {
            if(e.subType == "REGISTRATION_REQUIRED") {
                setShowRegisterModal(true);
            }
        }
    }

    const [values, setValues] = useState({nickname: '', above16: false, newsletter: false, email: ''});

    const [validationIssues, setValidationIssues] = useState({nickname : null, email: null, freshForm : true});

    const hasRegistrationIssues = () => {
        if(!values.email || !values.nickname || !values.above16) {
            return true;
        }
        return Object.values(validationIssues).filter((v) => v).length > 0;
    };

    const proxyurl = "";
    const sendEmailSubscription = async (email) => {
        const postData = await fetch(proxyurl + 'https://api.mailerlite.com/api/v2/groups/43202460/subscribers', {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({email}),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "X-MailerLite-ApiKey": MAILERLITE_API_KEY
                }
            });
        const result = await postData.json();
        if(result.error) {
            // subscriptionFailed
            throw new Error(result.error);
        }
        return result;
    }

    const submitRegisterForm = (e) => {
        e.preventDefault();
        (async () => {
            if(!hasRegistrationIssues()) {
                try {
                    const user = await register({...values, walletAddress});
                    //#region NEWSLETTER_SUBSCRIPTION
                    // if(user.newsLetter && user.above16) {
                    //     try {
                    //         sendEmailSubscription(values.email)
                    //     } catch(e) {
                    //         // console.log("")
                    //     }
                    // }
                    //#endregion NEWSLETTER_SUBSCRIPTION
                    setRegisteredUser(user);
                } catch (e) {
                    setShowErrorModal(true);
                } finally {
                    setShowRegisterModal(false);
                }
            }
        })();
    }

    const emailTest = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    const handleRegistrationInputChange = (e) => {
        let {name, value} = e.target;
        if(validationIssues.freshForm) {
            validationIssues.freshForm = null;
        }
        if(name == "email") {
            // console.log("INPUT", name, value);
            if(!value || value == "") {
                setValidationIssues({...validationIssues, [name] : "Please provide your email."})
            } else {
                const emailValidation = emailTest.test(value);
                if(!emailValidation) {
                    setValidationIssues({...validationIssues, [name] : "Invalid email address."});
                } else {
                    setValidationIssues({...validationIssues, [name] : null});
                }
            }
        } else if(name == "nickname") {
            // console.log("INPUT", name, value);
            if(!value || value == "") {
                setValidationIssues({...validationIssues, [name] : "Please provide your nickname."})
            } else {
                profanityCheck(value)
                .then(() =>  {
                    if(values.nickname || values.nickname != "") {
                        setValidationIssues({...validationIssues, [name] : null})
                    }
                })
                .catch((e) => {
                    if(e.subType == "PROFANITY_FOUND" && !validationIssues.nickname) {
                        setValidationIssues({...validationIssues, [name] : "Please select another nickname"});
                    }
                })
            }
        } else if (name == "above16" || name == "newsletter"){
            // console.log("INPUT", name, e.target.checked);
            if(name == "above16" ) {
                if(!e.target.checked) {
                    setValidationIssues({...validationIssues, [name] : "Please accept terms and conditions."});
                } else {
                    setValidationIssues({...validationIssues, [name] : null});
                }
            } 
            value = e.target.checked;
        }

        setValues({...values, [name]: value});
    };

    const onHideSucessModal = () => {
        try {
            login(async () =>  {
                return registeredUser;
            })
        } catch(e) {
            console.error(e);
        }
    }

    // TODO: remove this temporary hack
    let containerStyle = {
        backgroundColor: '#15151E',
        // width: '100%',
        paddingTop: '50px',
        paddingBottom: '50px',
        maxWidth: '1140px',
    }

    return (
        <>
        {(() => {
            if(user) {
                const path = (location.state && location.state.from) ? (location.state.hash) ? `${location.state.from.pathname}#${location.state.hash}` : location.state.from.pathname : '/profile';
                return <Redirect to={path} />
            }
        })()}
        <Container fluid style={containerStyle}>
            {/* <h2 className="text-left mb-5">{t("Your Ethereum wallet isn't accessible")}</h2> */}
            <Row className="justify-content-around">
                {/* <Col md="5">
                    <ConnectNew onSelectWallet={loginWithWallet}/>
                </Col> */}
                <Col md="5">
                    <ConnectExisting onSelectWallet={loginWithWallet}/>
                </Col>
            </Row>
        </Container>
        <Modal show={showRegisterModal} onHide={() => {}} className="register-modal">
            <Modal.Header>
                <Modal.Title>{t("Complete Your Profile")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="register-modal-content">
                <div>
                    <p>
                        { t('Your email address is only used for receiving important updates. Your Nickname will be seen by other REVV Time Trial players.')}
                    </p>
                </div>

                <Form id="registrationForm" className="register-form">
                    <Form.Group>
                        <Form.Label>{t('Your Wallet')}</Form.Label>
                        <div>{walletAddress}</div>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>{t('Email')}</Form.Label>
                        <Form.Label className="input-error-msg-label">{ validationIssues.email ? t(validationIssues.email) : '' }</Form.Label>
                        <Form.Control type="email" 
                            placeholder={t("Email Address")}
                            className="register-input" 
                            name="email"
                            onChange={handleRegistrationInputChange}
                            value={values.email}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>{t('Nickname')}</Form.Label>
                        <Form.Label className="input-error-msg-label">{ validationIssues.nickname ? t(validationIssues.nickname) : ''}</Form.Label>
                        <Form.Control type="text"
                            placeholder={t("Nickname")}
                            className="register-input"
                            name="nickname"
                            onChange={handleRegistrationInputChange}
                            value={values.nickname}
                        />
                    </Form.Group>
                    <Form.Group>
                    <div key={`default-checkbox-above16`} className="mb-3">
                        <div className="input-error-msg-label" style={{float : 'none'}}>{ validationIssues.above16 ? t(validationIssues.above16) : ''}</div>
                        <div className="customize-checkbox">
                            <FormCheck.Input 
                                type="checkbox" 
                                id="above16"
                                name="above16"
                                onChange={handleRegistrationInputChange}
                                checked={values.above16 ? 'checked' : ''} />
                            <label htmlFor="above16"></label>
                        </div>
                        <FormCheck.Label>
                            <Trans i18nKey="termsAndConditions">
                                {/* I confirm that I am 18 years or over and I agree to the <Link to="/terms" target="_blank">terms and conditions</Link> */}
                                I confirm that I am 18 years or over and I agree to the terms and conditions
                            </Trans>
                        </FormCheck.Label>
                    </div>
                    {/*#region NEWSLETTER_SUBSCRIPTION
                    <div key={`default-checkbox-newsletter`} className="mb-3">
                        <div className="customize-checkbox">
                            <FormCheck.Input 
                                type="checkbox" 
                                id="newsletter"
                                name="newsletter"
                                onChange={handleRegistrationInputChange}
                                checked={values.newsletter ? 'checked' : ''} />
                            <label htmlFor="newsletter"></label>
                        </div>
                        <FormCheck.Label>{t(`I agree to receive newsletters and promotional emails from Animoca Brands.`)}</FormCheck.Label>
                    </div> */}
                    
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <button type="submit" form="registrationForm" onClick={(e)=> {
                    e.preventDefault();
                    setShowRegisterModal(false)
                    } } className={"disabled-btn"}>{t("Cancel")}</button>
                <button type="submit" form="registrationForm" onClick={submitRegisterForm} className={!hasRegistrationIssues() ? "complete-btn" : "disabled-btn"}>{t("Submit")}</button>
            </Modal.Footer>
        </Modal>

        <Modal show={showSuccessModal} className="register-modal" centered>
            <Modal.Header>
                <Modal.Title>{t("Registration Complete")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="register-modal-content">
                <div>
                    <p>
                        { t('Welcome to REVV Time Trial')} 
                        <span style={{color: 'white' ,marginLeft: '8px'}}>{values.nickname}</span>
                    </p>
                    <p>
                        {t("For the final step, please verify your email account. Check your inbox to complete verification.")}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
            <button onClick={() => {setShowSuccessModal(false); setTimeout(onHideSucessModal, 0);}} className="complete-btn">{t("Close")}</button> 
            </Modal.Footer>
        </Modal>

        <Modal show={showErrorModal} onHide={() => {}} className="register-modal">
            <Modal.Header>
                <Modal.Title>{t("Error Occured")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="register-modal-content">
                <div>
                    <p>
                        { t('Please try again. Contact us if the issue persists.')}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
            <button onClick={() => setShowErrorModal(false)} className="complete-btn">{t("Close")}</button> 
            </Modal.Footer>
        </Modal>
        </>
    );
};

export {Connect};
