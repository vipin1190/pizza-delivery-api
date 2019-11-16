/**
 * Helper Library
 * @author
 *  vipin suthar
 * @description
 *  This library Defines the functions which  used within application,
 *  like third party library integration, functionality configurations, functions used repeatedly.
 */

// Import modules.
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;

// Declare variables.
const helpers = {};

/**
 * Convert string to object.
 * 
 * @param {string} str string to parse into JSON.
 */
helpers.parseJSONtoObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

/**
 * Validate Email Address.
 * 
 * @param {string} email Email address to be validate.
 */
helpers.validateEmailAddress = (email) => {
  const EmailRegExPatten = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return EmailRegExPatten.test(email);
};

/**
 * Create SHA hash of provided input.
 * 
 * @param {string} str Input String.
 */
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.trim().length > 0) {
    return crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
  } else {
    return false;
  }
};

/**
 * Generate random string of input length.
 * 
 * @param {number} stringLength Length of random string to be generated.
 */
helpers.createRandomString = (stringLength) => {
  if (typeof (stringLength) == 'number' && stringLength > 0) {
    let possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    // create random string.
    while (stringLength) {
      randomString = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      stringLength--;
    }
    return randomString;
  } else {
    return false;
  }
};

/**
 * Send mail.
 * @description
 *  send mail through third party mail api i.e. mailgun.
 * @param {string} subject Subject of the email1.
 * @param {string} message Text / HTML content of email body.
 * @param {string} to To recipient(s), Separated by commas.
 * @param {string} cc CC recipient(s), Separated by commas.
 * @param {string} bcc BCC recipient(s), Separated by commas.
 * @param {callback} callback callback function.
 */
helpers.sendEmail = (subject, message, to, cc, bcc, callback) => {
  const mailgun = config.settings.mailgun;
  let emailBody = {
    'from': mailgun.from,
    'to': to,
    'subject': subject,
    'text': message
  };
  let stringifyEmailBody = querystring.stringify(emailBody);
  let mailRequest = {
    'protocol': 'https:',
    'hostname': mailgun.hostname,
    'method': 'POST',
    'path': mailgun.path + '/messages',
    'auth': mailgun.username + ':' + mailgun.apiKey,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-length': Buffer.byteLength(stringifyEmailBody)
    }
  };

  // Send https request.
  const req = https.request(mailRequest, (res) => {
    if (res.statusCode == 200) {
      // Get response buffer.
      var decoder = new StringDecoder('utf-8');
      var buffer = '';

      // Listen to data event.
      res.on("data", (chunk) => {
        buffer += decoder.write(chunk);
      });
      buffer += decoder.end();

      // Listen to response end event.
      res.on("end", () => {
        callback(false, helpers.parseJSONtoObject(buffer));
      });
    } else {
      callback(`Unsuccessful response received with status code: ${res.statusCode}`);
    }
  });

  // Listen to error event.
  req.on("error", (e) => {
    callback(e);
  });

  // Attach email body.
  req.write(stringifyEmailBody);
  req.end();
};

/**
 * Stripe: Create token.
 * @description
 *  Create one time use token for use into charges https request.
 * @param {object} card An object consist of below params,
 *  number: The card number, as a string without any separators.
 *  exp_month: Two-digit number representing the card's expiration month.
 *  exp_year: Two or four-digit number representing the card's expiration year.
 *  cvc Card: security code. Highly recommended to always include this value, but it's required only for accounts based in European countries.
 *  name: Cardholder's full name.
 */
helpers.stripeCreateCardToken = (card, callback) => {
  const stripe = config.settings.stripe;
  let cardDetails = {
    'card[number]': card.number,
    'card[exp_month]': card.exp_month,
    'card[exp_year]': card.exp_year,
    'card[cvc]': card.cvc,
    'card[name]': card.name
  };
  let stringifyCardDetails = querystring.stringify(cardDetails);
  const tokenRequest = {
    'protocol': 'https:',
    'method': 'POST',
    'hostname': stripe.hostname,
    'path': stripe.path + 'tokens',
    'auth': stripe.secretKey + ':' + stripe.password,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-length': Buffer.byteLength(stringifyCardDetails)
    }
  };

  // Send https request.
  const req = https.request(tokenRequest, (res) => {
    if (res.statusCode == 200) {
      // Get response buffer.
      var decoder = new StringDecoder('utf-8');
      var buffer = '';

      // Listen to data event.
      res.on("data", (chunk) => {
        buffer += decoder.write(chunk);
      });
      buffer += decoder.end();

      // Listen to response end event.
      res.on("end", () => {
        callback(false, helpers.parseJSONtoObject(buffer));
      });
    } else {
      callback(`Unsuccessful response received with status code: ${res.statusCode}`);
    }
  });

  // Listen to error event.
  req.on("error", (e) => {
    callback(e);
  });

  // Write payload to request.
  req.write(stringifyCardDetails);
  req.end();
};

/**
 * Stripe: Create charge.
 * @description
 *  Create charge for processing payment on a one time source i.e. token.
 * @param {string} source A payment source to be charged, i.e. token.
 * @param {number} amount A positive integer representing how much to charge.
 * @param {string} description An arbitrary string which you can attach to a charge object.
 */
helpers.stripeCreateCharge = (source, amount, description, callback) => {
  const stripe = config.settings.stripe;
  let chargeDetails = {
    'amount': amount,
    'currency': stripe.currency,
    'source': source,
    'description': description
  };
  let stringifiedChargeDetails = querystring.stringify(chargeDetails);
  const chargeRequest = {
    'protocol': 'https:',
    'hostname': stripe.hostname,
    'method': 'POST',
    'path': stripe.path + 'charges',
    'auth': stripe.secretKey + ':' + stripe.password,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-length': Buffer.byteLength(stringifiedChargeDetails)
    }
  };

  const req = https.request(chargeRequest, (res) => {
    if (res.statusCode == 200) {
      var decoder = new StringDecoder('utf-8');
      var buffer = '';

      // Listen data event.
      res.on('data', (chunk) => {
        buffer += decoder.write(chunk);
      });
      buffer += decoder.end();

      // Listen response end event.
      res.on('end', () => {
        callback(false, helpers.parseJSONtoObject(buffer));
      });
    } else {
      callback(`Unsuccessful response received with status code: ${res.statusCode}`);
    }
  });

  // Listen error event.
  req.on("error", (e) => {
    callback(e);
  });

  // Write request payload.
  req.write(stringifiedChargeDetails);
  req.end();
};

// Exports module.
module.exports = helpers;