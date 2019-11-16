/**
 * @file
 *  User Management Handler HTTP operations.
 * @author
 *  vipin suthar
 * @description
 *  Provides operations for basic user profile management i.e. user create, user update, user delete, user view.
 */

// Import Modules.
const file_exp = require('./file_explorer');
const _token_handler = require('./_token_handler');
const helpers = require('./helpers');

// Declare variables.
const _users_handler = {};

/**
 * Users: HTTP Post request handler.
 * @description
 *  Require fields: firstName, lastName, phone, email, password.
 * @param {object} data User profile details.
 * @param {callback} callback Response callback.
 */
_users_handler.post = (data, callback) => {
  // Get profile parameters.
  var firstName = (typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
  var lastName = (typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
  var phone = (typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
  var email = (typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 && helpers.validateEmailAddress(data.payload.email.trim())) ? data.payload.email.trim() : false;
  var address = (typeof (data.payload.address) == 'string' && data.payload.address.trim().length > 0) ? data.payload.address.trim() : false;
  var password = (typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;

  if (firstName && lastName && phone && email && address && password) {
    file_exp.exists('users', phone, (exist) => {
      // Create user profile if not already exists.
      if (!exist) {
        let hashedPasscode = helpers.hash(password);
        var UserProfileObject = {
          'firstName': firstName,
          'lastName': lastName,
          'phone': phone,
          'email': email,
          'address': address,
          'hashedPasscode': hashedPasscode
        };

        // Create user.
        file_exp.create('users', phone, UserProfileObject, (err) => {
          if (!err) {
            callback(200, { 'Success': 'User created.' });
          } else {
            callback(500, { 'Error': 'Could not create user profile.' });
          }
        });
      } else {
        callback(400, { 'Error': 'User profile may already exists.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

/**
 * Users: HTTP Put request handler.
 * @description
 *  Required fields: phone
 *  Optional fields: firstName, lastName, address, password
 * @param {object} data User profile values to update.
 * @param {callback} callback Response callback.
 */
_users_handler.put = (data, callback) => {
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key.trim() : false;

  if (key) {
    // Verify API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, UserProfileObject) => {
      if (status) {
        // Get possible update fields.
        var firstName = (typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
        var lastName = (typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
        var address = (typeof (data.payload.address) == 'string' && data.payload.address.trim().length > 0) ? data.payload.address.trim() : false;
        var password = (typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;

        // Verify input.
        if (firstName || lastName || address || password) {
          if (firstName) {
            UserProfileObject.firstName = firstName;
          }
          if (lastName) {
            UserProfileObject.lastName = lastName;
          }
          if (address) {
            UserProfileObject.address = address;
          }
          if (password) {
            UserProfileObject.hashedPasscode = helpers.hash(password);
          }

          // Update user profile.
          file_exp.update('users', UserProfileObject.phone, UserProfileObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(400, { 'Error': 'User update failed.' });
            }
          });
        } else {
          callback(400, { 'Error': 'Invalid input(s) to update' });
        }
      } else {
        callback(400, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

/**
 * Users: HTTP Get request handler.
 * @description
 *  Require header: key
 *  Require fields: password
 * @param {object} data User profile details.
 * @param {callback} callback Response callback.
 */
_users_handler.get = (data, callback) => {
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key.trim() : false;

  if (key) {
    // Verify API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status) {
        delete userDetails.hashedPasscode;
        callback(200, userDetails);
      } else {
        callback(400, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

/**
 * Users: HTTP Delete request handler.
 * @description
 * @param {object} data User payload object.
 * @param {callback} callback Response callback.
 */
_users_handler.delete = (data, callback) => {
  var password = (typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key.trim() : false;

  if (password && key) {
    // Verify API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      let passwordHash = helpers.hash(password);
      if (status && passwordHash == userDetails.hashedPasscode) {
        // Delete user profile object.
        file_exp.delete('users', userDetails.phone, (err) => {
          if (!err) {
            // Remove associated API key object.
            file_exp.delete('tokens', key, (err) => {
              callback(200);
            });
          } else {
            callback(500, { 'Error': 'Failed to delete user.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Invalid key or password.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

module.exports = _users_handler;