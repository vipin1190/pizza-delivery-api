/**
 * @file
 *  Shopping cart.
 * @author
 *  vipin suthar
 * @description
 *  Provide Shopping Cart based HTTP operations, i.e. add cart, updated cart, view cart, delete cart.
 */

// Import dependency modules.
const helpers = require('./helpers');
const file_exp = require('./file_explorer');
const _token_handler = require('./_token_handler');
const _item_handler = require('./_item_handler');

// Declarations.
const _shopping_cart = {};
const allowedCartActions = ['add', 'remove'];

/**
 * Shopping Cart: Post HTTP request handler.
 * @description
 *  Required fields: key.
 */
_shopping_cart.post = (data, callback) => {
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key : false;

  if (key) {
    // Verify is API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status && tokenDetails.phone > 0) {
        // Verify user has no active cart.
        if (userDetails.cart === undefined) {
          // Generate cart id.
          var cartId = helpers.createRandomString(20);
          var cartDetails = {
            "cartId": cartId,
            "cartItems": []
          };
          userDetails.cart = cartId;

          // create cart file.
          file_exp.create('carts', cartId, cartDetails, (err) => {
            if (!err) {
              // Update user profile with cartId.
              file_exp.update('users', userDetails.phone, userDetails, (err) => {
                if (!err) {
                  callback(200, cartDetails);
                } else {
                  callback(500, { 'Error': 'Failed to attach cart with user.' });
                }
              });
            } else {
              callback(500, { 'Error': 'Failed to create cart.' });
            }
          });
        } else {
          callback(400, { 'Error': 'User already having an active cart.' });
        }
      } else {
        callback(401, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

/**
 * Shopping Cart: Get HTTP request handler.
 * @description
 *  Required fields: key.
 */
_shopping_cart.get = (data, callback) => {
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key : false;

  if (key) {
    // Verify if API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status) {
        // Get cart details.
        file_exp.read('carts', userDetails.cart, (err, cartDetails) => {
          if (!err && cartDetails) {
            callback(200, cartDetails);
          } else {
            callback(404, { 'Error': 'Cart not found.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fields.' });
  }
};

/**
 * Shopping Cart: Put HTTP request handler.
 * @description
 *  Required fields: key.
 *  Allowed query string fields: add, remove
 */
_shopping_cart.put = (data, callback) => {
  // Get item variables.
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key : false;
  var itemAction = (typeof (data.payload.itemAction) == 'string' && allowedCartActions.indexOf(data.payload.itemAction) > -1) ? data.payload.itemAction : false;
  var itemCategory = (typeof (data.payload.itemCategory) == 'string') ? data.payload.itemCategory : false;
  var itemId = (typeof (data.payload.itemId) == 'string') ? data.payload.itemId : false;
  var quantity = (typeof (data.payload.quantity) == 'number' && data.payload.quantity > 0) ? data.payload.quantity : false;

  if (key && itemAction && itemCategory && itemId && quantity) {
    // Verify if API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status) {
        // Get cart object.
        file_exp.read('carts', userDetails.cart, (err, cartDetails) => {
          if (!err && cartDetails) {
            // Get Item details.
            _item_handler.get_item(itemId, itemCategory, (status, itemDetails) => {
              if (status && itemDetails) {
                // Process cart.
                _shopping_cart.processCartAction(itemAction, itemCategory, cartDetails.cartItems, itemId, quantity, (status, processedCart, message) => {
                  if (status && processedCart) {
                    cartDetails.cartItems = processedCart;
                    // Update cart details.
                    file_exp.update('carts', userDetails.cart, cartDetails, (err) => {
                      if (err) {
                        callback(500, { 'Error': 'Failed to update cart.' });
                      } else {
                        callback(200);
                      }
                    });
                  } else {
                    callback(400, message);
                  }
                });
              } else {
                callback(400, { 'Error': 'Item not exists in provided category.' });
              }
            });
          } else {
            callback(500, { 'Error': 'Invalid cartId.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fields.' });
  }
};

/**
 * Shopping Cart: Delete HTTP request handler.
 * @description
 *  Required fields: key, cartId
 */
_shopping_cart.delete = (data, callback) => {
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key : false;

  if (key) {
    // Verify if API key is valid.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status) {
        if (userDetails.cart !== undefined) {
          var cartId = userDetails.cart;
          delete userDetails.cart;
          // Update user object.
          file_exp.update('users', userDetails.phone, userDetails, (err) => {
            if (!err) {
              // Remove cart from directory.
              file_exp.delete('carts', cartId, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log({
                    'requestType': 'Remove CartId',
                    'requestFile': '_shopping_cart.js',
                    'requestMethod': '_shopping_cart.delete',
                    'error': 'Failed to remove cartID file: ' + cartId
                  });
                  callback(200);
                }
              });
            } else {
              callback(500, { 'Error': 'Failed to remove cart from user profile.' });
            }
          });
        } else {
          callback(400, { 'Error': 'No active cart found.' });
        }
      } else {
        callback(400, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fields.' });
  }
};

/**
 * Shopping Cart: Find Item in cart.
 *  
 * @param {string} itemId Id of item in item list.
 * @param {object} cartDetails The item category list.
 * @returns {number} The index of itemId in cart if found else -1.
 */
_shopping_cart.findItem = (itemId, cartDetails) => {
  var ItemIndex = -1;
  if (cartDetails !== undefined && cartDetails.length > 0) {
    cartDetails.forEach((value, index) => {
      if (ItemIndex == -1 && value.itemId == itemId) {
        ItemIndex = index;
      }
    });
  }
  return ItemIndex;
};

/**
 * Shopping Cart: Process cart list for item action.
 * 
 * @param {string} action The action value.
 * @param {object} cartItems Object of cart items.
 * @param {string} itemId The id of item to be process for cart.
 * @param {number} quantity The quantity of items of itemId type.
 * @param {callback} callback The callback function.
 */
_shopping_cart.processCartAction = (action, itemCategory, cartItems, itemId, quantity, callback) => {
  let ItemIndex = _shopping_cart.findItem(itemId, cartItems);
  let success = false;
  let message = {};

  // Process item for add or remove.
  if (ItemIndex > -1 && action == 'add') {
    cartItems[ItemIndex]['quantity'] += quantity;
    success = true;
  } else if (ItemIndex > -1 && action == 'remove') {
    cartItems[ItemIndex]['quantity'] -= quantity;
    if (cartItems[ItemIndex]['quantity'] < 1) {
      cartItems.splice(ItemIndex, 1);
    }
    success = true;
  } else if (ItemIndex == -1 && action == 'add') {
    cartItems.push({
      "itemCategory": itemCategory,
      "itemId": itemId,
      "quantity": quantity
    });
    success = true;
  } else {
    message.Error = 'Invalid item or action to process with cart.';
  }
  callback(success, cartItems, message);
};

// Export module.
module.exports = _shopping_cart;