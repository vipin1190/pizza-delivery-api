/**
 * @file
 *  Order Handler
 * @author
 *  vipin suthar
 * @description
 *  Provides functions for order related HTTP operations.
 */

// Import modules.
const file_exp = require('./file_explorer');
const _token_handler = require('./_token_handler');
const helpers = require('./helpers');

// Declare variables.
const _order_handler = {};

/**
 * Order Handler: Post HTTP request Handler.
 * @description
 *  Required fields: key.
 */
_order_handler.post = (data, callback) => {
  // Get card variables.
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key : false;
  var sourceTokenId = typeof (data.payload.tokenId) == 'string' && data.payload.tokenId.trim().length > 0 ? data.payload.tokenId.trim() : false;
  // let number = typeof (data.payload.number) == 'string' && data.payload.number.trim().length == 16 ? data.payload.number.trim() : false;
  // let exp_year = typeof (data.payload.exp_year) == 'string' && data.payload.exp_year.trim().length == 2 ? data.payload.exp_year.trim() : false;
  // let exp_month = typeof (data.payload.exp_month) == 'string' && data.payload.exp_month.trim().length == 2 ? data.payload.exp_month.trim() : false

  // let cvc = typeof (data.payload.cvc) == 'string' && data.payload.cvc.trim().length == 3 ? data.payload.cvc.trim() : false;
  // let name = typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;

  if (key && sourceTokenId) {
    // Create card object.
    // var cardDetails = { 'number': number, 'exp_month': exp_month, 'exp_year': exp_year, 'cvc': cvc, 'name': name };

    // Verify API token.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status && tokenDetails.phone > 0) {
        // Get user details.
        if (userDetails && userDetails.cart !== undefined) {
          // Get order details.
          _order_handler.getOrderParticulars(userDetails.cart, (err, message, particulars) => {
            if (!err && particulars) {
              // Create order details object.
              let orderDetails = {
                'orderId': 'PDAOID' + Date.now(),
                'cartId': userDetails.cart,
                'order': {
                  'time': Date.now(),
                  'particulars': particulars,
                  'total': 0,
                  'deliveryTo': userDetails.address
                },
                'user': {
                  'firstName': userDetails.firstName,
                  'userEmail': userDetails.email,
                },
                'payment': {
                  'status': 0
                }
              };

              // Generate invoice.
              _order_handler.generateInvoice(orderDetails, (err) => {
                if (!err) {
                  // Request for creating token source for user card details.
                  // helpers.stripeCreateCardToken(cardDetails, (err, tokenObj) => {
                  // if (!err && tokenObj) {
                  let desc = `Receiving payment of ${orderDetails.order.total} for ${orderDetails.user.userEmail}`;
                  // orderDetails.payment.sourceId = tokenObj.id;

                  // Request for creating a charge with stripe.
                  helpers.stripeCreateCharge(sourceTokenId, orderDetails.order.total, desc, (err, chargeObj) => {
                    if (!err && chargeObj && chargeObj.paid) {
                      // Update payment status.
                      orderDetails.payment.chargeId = chargeObj.id;
                      orderDetails.payment.created = chargeObj.created;
                      orderDetails.payment.status = 1;

                      // create cart file.
                      file_exp.create('orders', orderDetails.orderId, orderDetails, (err) => {
                        if (!err) {
                          // Add this order to user's order history.
                          if (userDetails.orders == undefined) {
                            userDetails.orders = [];
                          }
                          userDetails.orders.push(orderDetails.orderId);
                          // Delete cart id from user object.
                          delete userDetails.cart;
                          // Update user profile with cartId.
                          file_exp.update('users', userDetails.phone, userDetails, (err) => {

                            if (!err) {
                              // Get invoice html.
                              file_exp.read('invoice', orderDetails.orderId, 'html', (err, html) => {
                                if (!err) {
                                  // Send order receipt.
                                  helpers.sendEmail("Your pizza order", html, orderDetails.user.userEmail, '', '', (err) => {
                                    if (!err) {
                                      callback(200);
                                    } else {
                                      callback(500, { 'Error': 'Failed to send order receipt.' });
                                    }
                                  });
                                } else {
                                  callback(500, { 'Error': 'Failed to get invoice receipt.' });
                                }
                              });
                            } else {
                              callback(500, { 'Error': 'Failed to update order details with user.' });
                            }
                          });
                        } else {
                          callback(500, { 'Error': 'Failed to create order.' });
                        }
                      });
                    } else {
                      callback(402, { 'Error': 'Invalid payment tokenId.' });
                    }
                  });
                } else {
                  callback(500, { 'Error': 'Failed to generate invoice.' });
                }
              });
            } else {
              callback(400, message);
            }
          });
        } else {
          callback(404, { 'Error': 'Shopping cart not found.' });
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
 * Order Handler: Get invoice particulars.
 * @description
 *  Provides particulars with details requires for invoice generation.
 * @param {string} cartId The unique and valid cartId associated with logged in user.
 * @param {callback} callback callback handler.
 */
_order_handler.getOrderParticulars = (cartId, callback) => {
  // Read cart for items.
  file_exp.read('carts', cartId, (err, cartDetails) => {
    if (!err && cartDetails && cartDetails.cartItems.length > 0) {
      // Read master item list.
      file_exp.read('items', '_list_items', (err, listItems) => {
        if (!err && listItems && listItems) {
          var particulars = [];
          // Get each cart item details from master list.
          cartDetails.cartItems.forEach(element => {
            if (listItems[element.itemCategory] !== undefined && listItems[element.itemCategory][element.itemId] !== undefined) {
              let item = listItems[element.itemCategory][element.itemId];
              particulars.push({
                "itemCategory": element.itemCategory,
                "itemId": element.itemId,
                "particular": item.name,
                "qty": element.quantity,
                "rate": item.price,
                "value": parseFloat(item.price * element.quantity)
              });
            }
          });
          callback(false, {}, particulars);
        } else {
          callback(true, { 'Error': 'Failed to process item list.' });
        }
      });
    } else {
      callback(true, { 'Error': 'No items found to order.' });
    }
  });
};

/**
 * Generate Invoice.
 * @description
 *  Generates final invoice file and calculates invoice total.
 * @param {object} orderDetails An object consist of order details.
 * @param {callback} callback callback handler.
 */
_order_handler.generateInvoice = (orderDetails, callback) => {
  var particularRows = '';
  var total = 0;
  orderDetails.order.particulars.forEach(element => {
    let td = '';
    td += `<td>${element.particular}</td>`;
    td += `<td>${element.rate}</td>`;
    td += `<td>${element.qty}</td>`;
    td += `<td>${element.value}</td>`;

    total += element.value;
    particularRows += `<tr>${td}</tr>`;
  });

  // Assign order total.
  orderDetails.order.total = total;

  // Read invoice structure file.
  file_exp.read('invoice', 'invoice_frame', 'html', (err, html) => {
    if (!err && html.length > 0) {
      // Get human readable date.
      let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      let now = new Date();
      let deliveryTime = new Date(now);
      deliveryTime.setMinutes(now.getMinutes() + 45);

      // Create merge codes and get final invoice.
      let replaceValue = {
        '#USER_FIRST_NAME': orderDetails.user.firstName,
        '#CALCULATED_DELIVERY_TIME': deliveryTime.toLocaleString('en-us', options),
        '#USER_DELIVERY_ADDRESS': orderDetails.order.deliveryTo,
        '#ORDER_ID': orderDetails.orderId,
        '#ORDER_TIME': now.toLocaleString('en-us', options),
        '#ORDER_PARTICULARS': particularRows,
        '#ORDER_TOTAL': total,
        '#PAYMENT_METHOD': 'Card'
      };
      let regEx = new RegExp(Object.keys(replaceValue).join("|"), "gi");
      let invoiceHtmlData = html.replace(regEx, (matchValue) => {
        return replaceValue[matchValue];
      });

      // Create invoice file.
      file_exp.create('invoice', orderDetails.orderId, invoiceHtmlData, 'html', (err) => {
        if (!err) {
          callback(false);
        } else {
          callback(true);
        }
      });
    } else {
      callback(true);
    }
  });
};

/**
 * Order Handler: Get HTTP request Handler.
 * @description
 *  Required fields: key, OrderId.
 */
_order_handler.get = (data, callback) => {
  let key = (typeof (data.headers.key) == 'string' && data.headers.key.trim().length == 20) ? data.headers.key : false;
  let orderId = typeof (data.payload.orderId) == 'string' && data.payload.orderId.trim().length > 0 ? data.payload.orderId.trim() : false;

  if (key && orderId) {
    // Verify API token.
    _token_handler.verifyToken(key, (status, tokenDetails, userDetails) => {
      if (status && tokenDetails.phone > 0) {
        if (userDetails.orders !== undefined && userDetails.orders.constructor === Array && userDetails.orders.indexOf(orderId) > -1) {
          // Fetch order details.
          file_exp.read('orders', orderId, (err, orderDetails) => {
            if (!err && orderDetails) {
              callback(200, orderDetails);
            } else {
              callback(500, { 'Error': 'Failed to get order details.' });
            }
          });
        } else {
          callback(404, { 'Error': 'Invalid order.' });
        }
      } else {
        callback(401, { 'Error': 'Invalid key.' });
      }
    });
  } else {
    callback(400, { "Error": "Missing required field." });
  }
};

// Export module.
module.exports = _order_handler;
