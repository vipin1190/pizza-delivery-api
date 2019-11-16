/**
 * Request Handlers.
 * @author
 *  vipin suthar
 * @description
 *  Provides handlers for request types.
 */

// Import Modules.
const _users_handler = require('./_users_handler');
const _token_handler = require('./_token_handler');
const _item_handler = require('./_item_handler');
const _shopping_cart = require('./_shopping_cart');
const _order_handler = require('./_order_handler');

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

/**
 * Token Handler
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.tokens = (data, callback) => {
  let method = data.method.toLowerCase();
  if (typeof (method) == 'string' && allowedHttpMethods.indexOf(method) > -1) {
    _token_handler[method](data, callback);
  } else {
    callback(405);
  }
};

/**
 * Menu Handler.
 * @description
 *  Provide menu categories to select item from.
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.menu = (data, callback) => {
  let method = data.method.toLowerCase();
  if (typeof (method) == 'string' && method == 'get') {
    let menu_categories = {
      'category': ['_pizzas', '_drinks', '_desserts']
    };
    callback(200, menu_categories);
  } else {
    callback(405);
  }
};

/**
 * Item Handler.
 * @description
 *  Provide item list on provided menu category.
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.items = (data, callback) => {
  let method = data.method.toLowerCase();
  if (typeof (method) == 'string' && method == 'get') {
    _item_handler.get(data, callback);
  } else {
    callback(405);
  }
};

/**
 * Shopping Cart Handler.
 * @description
 *  Provide HTTP methods to manage cart operations.
 * 
 * @param {object} data object of request parameters.
 * @param {callback} callback Response Callback.
 */
handlers.cart = (data, callback) => {
  let method = data.method.toLowerCase();
  if (typeof (method) == 'string' && allowedHttpMethods.indexOf(method) > -1) {
    _shopping_cart[method](data, callback);
  } else {
    callback(405);
  }
};

/**
 * Orders Hander.
 * @description
 *  Provide HTTP methods to manage order operations.
 */
handlers.orders = (data, callback) => {
  let method = data.method.toLowerCase();
  if (typeof (method) == 'string' && allowedHttpMethods.indexOf(method) > -1) {
    _order_handler[method](data, callback);
  } else {
    callback(405);
  }
};

// Export module.
module.exports = handlers;