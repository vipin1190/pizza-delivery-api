/** 
 * Pizza Delivery API
 * @author
 *  vipin suthar
 * @description
 *  Pizza Delivery API is a nodeJS ReSTful application provides services for
 *  most basic and common operational processes.
 */

// Load application libraries.
const server = require('./lib/server');
const fs = require('fs');

// Decalre variables.
const app = {};

// Verify default system states.
app.verifyDefaults = () => {
  // Create if directories not exists.
  let path = ['./.data', './.data/users', './.data/tokens', './.data/orders', './.data/items',
    './.data/invoice', './.data/carts'];

  path.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
};

// Manage libraries.
app.init = () => {
  server.init();
  app.verifyDefaults();
};

// Initiate application components.
app.init();

// Export module.
module.exports = app;
