import React, { useState } from 'react';
import ReactGA from 'react-ga';
import './Fragments.scss';
// import {Web3Context} from '../web3';
import { useTranslation } from 'react-i18next';
// import fortmaticLogo from '../assets/img/logos/logo-fortmatic.png';
import { AccordionContent } from '../components/Accordion/AccordionContent';
import { Accordion, Button } from 'react-bootstrap';
// import fortmaticImage1 from '../assets/img/faq/fortmatic_1.png';
// import fortmaticImage2 from '../assets/img/faq/fortmatic_2.png';
// import fortmaticImage3 from '../assets/img/faq/fortmatic_3.png';
// import fortmaticImage4 from '../assets/img/faq/fortmatic_4.png';


function ConnectNew(props) {

    const {t} = useTranslation();
    const [ activeKey, setActiveKey ] = useState(0);

    const faqs = [
        {
            id: 1,
            name: t("What is Ethereum?"),
            description: [
                t("Ethereum is a decentralized blockchain-based network that operates on a purely peer-to-peer network.")
            ]
        },
        {
            id: 2,
            name: t("What is Fortmatic"),
            description: [
				t('Step') + " #1",
				t("When you click to create a Formatic Wallet, you will need to input your mobile phone number, and then touch the arrow or hit enter."),
				// <img src={fortmaticImage1} alt="Step 1" style={{width: `100%`, maxWidth: `500px`}} />,
				t('Step') + " #2",
				t('You will now receive a message to your registered mobile number with a confirmation number. Input the confirmation number.'),
				// <img src={fortmaticImage2} alt="Step 2" style={{width: `100%`, maxWidth: `500px`}} />,
				t('Step') + " #3",
				t('You will now need to create a secure pin for accessing your Fortmatic Wallet.'),
				// <img src={fortmaticImage3} alt="Step 3" style={{width: `100%`, maxWidth: `500px`}} />,
				t('Step') + " #4",
				t('Finally, click "Verify" to allow REVV Time Trial to access your newly created Wallet.'),
				// <img src={fortmaticImage4} alt="Step 4" style={{width: `100%`, maxWidth: `500px`}} />,
				t('Step') + " #5",
				t('Once Verified, you\'re now good to go.')
			]
        },
        {
            id: 3,
            name: t("I don't own any Cryptocurrency... can I still play?"),
            description: [
                t("Yes. If you own a valid credit card, you will be able to make purchases.")
            ]
        }
    ]

    const handleCreateWallet = () => {
        props.onSelectWallet("fortmatic");

        ReactGA.event({
            category: 'Connect',
            action: 'create-new'
        });
    }

    return (
        <>
        <fieldset className="content-register-border content-left connect-new-fieldset">
            <legend className="beginners-legend">
                <h3>{t('New to Blockchain?')}</h3>
            </legend>
            <div className="connect-new-section">
                <p>{t('You need to create an account to play REVV Time Trial.')}</p>
            </div>
            <div className="create-wallet-section">
                <div>
                    <Button size="lg" variant="revv" onClick={handleCreateWallet} block>{t('Create Account')}</Button>
                </div>
                {/*<div>
                    <span>with </span> <img src={fortmaticLogo} className="fortmatic-inline" />
                </div>*/}
            </div>
            
            <div className="accordion-container App-faq-category">
                <Accordion activeKey={activeKey}>
                    { faqs.map((content) => 
                        <AccordionContent key={content.id} 
                                            id={content.id} 
                                            title={content.name} 
                                            description={content.description}
                                            currentActiveKey={activeKey}
                                            handleClick={setActiveKey} /> )}
                </Accordion>   
            </div>
        </fieldset>
        </>
    );
}

export default ConnectNew;
