import axios from "axios";

import logger from 'winston';
const headers = {
  "Content-type": "application/json",
  "X-MailerLite-ApiKey": "98eaf7fcf49775d24829f51335e7c998"
};

const middlewareFn = async (req, res, next) => {
  try {
    const {email, nickname} = req.user;
    const values = {email, name : nickname};
    const response = await axios.post('https://api.mailerlite.com/api/v2/groups/70844054/subscribers', values, {headers});
    logger.debug(`User ${req.user.nickname} subscribed to REVV Time Trial newsletter`, response.data);
    next();
  } catch (e) {
    // should not failed the user if the subscription service is down.
    logger.error("Error subcribing newsletter", e);
    next();
  }

}


export {middlewareFn as mailerliteNewsletterSubscription};