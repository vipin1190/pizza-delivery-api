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

// Exports module.
module.exports = helpers;