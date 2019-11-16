/**
 * @file
 *  User Authentication token handler HTTP operations.
 * @author
 *  vipin suthar
 * @description
 *  Provides operations for basic user authentication token management i.e. token create, token update, token delete, token view.
 */

// Import Modules.
const file_exp = require('./file_explorer');
const helpers = require('./helpers');

// Declare variables.
const _token_handler = {};

/**
 * Tokens: HTTP Post request handler.
 * @description
 *  Required fields: phone, password.
 */
_token_handler.post = (data, callback) => {
  var phone = (typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
  var password = (typeof (data.payload.password) == 'string' && data.payload.password.length > 0) ? data.payload.password : false;

  if (phone && password) {
    // Read user object.
    file_exp.read('users', phone, (err, userData) => {
      if (!err && userData) {
        let hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPasscode) {
          // Read token object.
          file_exp.read('tokens', userData.key, (err, tokenData) => {
            if (tokenData == undefined || tokenData.expires < Date.now()) {
              let tokenId = helpers.createRandomString(20);
              if (tokenId) {
                var tokenObject = {
                  'phone': userData.phone,
                  'expires': Date.now() + 1000 * 60 * 60,
                  'key': tokenId
                };

                // Assign token id to user object.
                userData.key = tokenId;
                // Create token object.
                file_exp.create('tokens', tokenId, tokenObject, (err) => {
                  if (!err) {
                    // Update user data.
                    file_exp.update('users', userData.phone, userData, (err) => {
                      if (!err) {
                        // Delete last token object if exist.
                        if (tokenData !== undefined) {
                          file_exp.delete('tokens', tokenData.key, (err) => { });
                        }
                        callback(200, tokenObject);
                      } else {
                        callback(500, { 'Error': 'Failed to update user' });
                      }
                    });
                  } else {
                    callback(500, { 'Error': 'Failed to create new token.' });
                  }
                });
              } else {
                console.log({
                  'requestType': 'Create Token',
                  'requestFile': '_token_handler.js',
                  'requestMethod': '_token_handler.post',
                  'error': 'Failed to create createRandomString'
                });
                callback(500, { 'Error': 'Failed to create token.' });
              }
            } else {
              callback(400, { 'Error': 'Already having an active token.' });
            }
          });
        } else {
          callback(400, { 'Error': 'Invalid password.' });
        }
      } else {
        callback(404, { 'Error': 'User does not exist.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fields.' });
  }
};

/**
 * Tokens: HTTP Get request handler.
 * @description
 *  Required fields: key
 */
_token_handler.get = (data, callback) => {
  var tokenId = (typeof (data.payload.key) == 'string' && data.payload.key.trim().length == 20) ? data.payload.key.trim() : false;
  if (tokenId) {
    // Read token object.
    file_exp.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { 'Error': 'Invalid key' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

/**
 * Tokens: HTTP Put request handler.
 * @description
 *  Required fields: key
 */
_token_handler.put = (data, callback) => {
  var tokenId = (typeof (data.payload.key) == 'string' && data.payload.key.trim().length == 20) ? data.payload.key.trim() : false;
  if (tokenId) {
    // Read token object.
    file_exp.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData.expires > Date.now()) {
        tokenData.expires = Date.now() + 1000 * 60 * 60;
        // Update token object.
        file_exp.update('tokens', tokenId, tokenData, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Failed to update key.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Either key is invalid or already expired.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

/**
 * Tokens: HTTP delete request handler.
 * @description
 *  Required fields: key
 */
_token_handler.delete = (data, callback) => {
  var tokenId = (typeof (data.payload.key) == 'string' && data.payload.key.trim().length == 20) ? data.payload.key.trim() : false;
  if (tokenId) {
    // Read token object.
    file_exp.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        // Remove key from user profile
        file_exp.read('users', tokenData.phone, (err, userData) => {
          if (!err && userData) {
            delete userData.key;
            // Update user object.
            file_exp.update('users', tokenData.phone, userData, (err) => {
              if (!err) {
                // Finally remove token file.
                file_exp.delete('tokens', tokenId, (err) => {
                  if (err) {
                    console.log({
                      'requestType': 'Remove Token',
                      'requestFile': '_token_handler.js',
                      'requestMethod': '_token_handler.delete',
                      'error': 'Failed to remove token object file.'
                    });
                  }
                  callback(200);
                });
              } else {
                callback(500, { 'Error': 'Failed to update user.' });
              }
            });
          } else {
            callback(404, { 'Error': 'Failed to find user profile for update.' });
          }
        });
      } else {
        callback(404, { 'Error': 'Invalid key' });
      }
    });
  }
};

/**
 * Tokens: Verify key and phone.
 * @description
 *  Required fields: key, phone
 * 
 * @param {string} key a 20 character long valid token id.
 * @param {callback} callback returns whether key is valid or not.
 */
_token_handler.verifyToken = (key, callback) => {
  // Read tokens for API key.
  file_exp.read('tokens', key, (err, tokenDetails, userDetails) => {
    if (!err && tokenDetails !== undefined && tokenDetails.phone > 0 && tokenDetails.expires > Date.now()) {
      // Get a valid user object.
      file_exp.read('users', tokenDetails.phone, (err, userDetails) => {
        if (!err && userDetails && tokenDetails.key === userDetails.key) {
          callback(true, tokenDetails, userDetails);
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  });
};

// Export functionality.
module.exports = _token_handler;