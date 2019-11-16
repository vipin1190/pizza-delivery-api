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

  if (key && category) {
    // Verify if API key is valid.
    _token_handler.verifyToken(key, (status) => {
      if (status) {
        // Get item list object.
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

/**
 * Items: Get item details, if exists.
 * 
 * @param {string} itemId Item id of a particular item.
 * @param {string} itemCategory Category of the item.
 */
_item_handler.get_item = (itemId, itemCategory, callback) => {
  // Get item list object.
  file_exp.read('items', '_list_items', (err, listItems) => {
    if (!err && listItems && listItems[itemCategory] !== undefined && listItems[itemCategory][itemId] !== undefined) {
      callback(true, listItems[itemCategory][itemId]);
    } else {
      callback(false, {});
    }
  });
};

// Export functionality.
module.exports = _item_handler;