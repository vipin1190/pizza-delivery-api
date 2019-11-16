/**
 * Request Handlers.
 * @author
 *  vipin suthar
 * @description
 *  Provides handlers for request types.
 */

// Import Modules.
const _users_handler = require('./_users_handler');

// Declare variables.
const handlers = {};
const allowedHttpMethods = ['get', 'post', 'put', 'delete'];

/**
 * Default request handler
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.notFound = (data, callback) => {
  callback(404);
};

/**
 * Ping Handler
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.ping = (data, callback) => {
  callback(200);
};

/**
 * Users Handler
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.users = (data, callback) => {
  let method = data.method.toLowerCase();
  if (typeof (method) == 'string' && allowedHttpMethods.indexOf(method) > -1) {
    _users_handler[method](data, callback);
  } else {
    callback(405);
  }
};

// Export module.
module.exports = handlers;