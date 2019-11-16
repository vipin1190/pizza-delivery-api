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

// Decalre variables.
const app = {};

// Manage libraries.
app.init = () => {
  server.init();
};

// Initiate application components.
app.init();

// Export module.
module.exports = app;
