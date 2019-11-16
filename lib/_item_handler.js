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
const _token_handler = require('./_token_handler');

// Declare variables.
const _item_handler = {};

/**
 * Items: HTTP Get request handler.
 * @description
 *  Handler listing operation of items on provided category.
 */
_item_handler.get = (data, callback) => {
  let category = (typeof (data.payload.category) == 'string' && data.payload.category.trim().length > 0) ? data.payload.category.trim() : false;
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key.trim() : false;
  let phone = (typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;

  if (phone && key && category) {
    _token_handler.verifyToken(key, phone, (status) => {
      if (status) {
        file_exp.read('items', '_list_items', (err, listItems) => {
          if (!err && listItems && listItems[category] !== undefined) {
            callback(200, listItems[category]);
          } else {
            callback(405, { 'Error': 'Invalid item category.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

// Export functionality.
module.exports = _item_handler;