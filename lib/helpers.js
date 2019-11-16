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
  const EmailRegExPatten = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
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
 * @param {string} to To recipient(s), Separated by commas.
 * @param {string} cc CC recipient(s), Separated by commas.
 * @param {string} bcc BCC recipient(s), Separated by commas.
 * @param {string} subject Subject of the email1.
 * @param {string} message Text / HTML content of email body.
 * @param {callback} callback callback function.
 */
helpers.sendEmail = (to, cc, bcc, subject, message, callback) => {
  const mailgun = config.settings.mailgun;
  let emailBody = {
    'from': mailgun.from,
    'to': to,
    'subject': subject,
    'text': message,
    'html': '<html>' + message + '</html>'
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

// Exports module.
module.exports = helpers;