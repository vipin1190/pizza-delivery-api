/**
 * Request Handlers.
 * @author
 *  vipin suthar
 * @description
 *  Provides handlers for request types.
 */

// Declare variables.
const handlers = {};

// Default request handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Ping Handler
handlers.ping = (data, callback) => {
  callback(200);
};

// Export module.
module.exports = handlers;