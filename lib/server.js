/**
 * Application Web Server.
 * @author
 *  vipin suthar
 * @description
 *  Defines nodejs application web server.
 */

// Declare dependencies.
const config = require('./config');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./helpers');
const handlers = require('./handlers');

// Declare variables.
const server = {};

// HTTPS server parameteres.
server.httpsServerParams = {
  'key': fs.readFileSync(path.join(__dirname, './https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, './https/cert.pem'))
};

// Create HTTPS encrypted server.
server.httpsServer = https.createServer(server.httpsServerParams, (req, resp) => {
  unifiedServer(req, resp);
});

// Create HTTP server.
server.httpServer = http.createServer((req, resp) => {
  unifiedServer(req, resp);
});

// Create unified server handler.
const unifiedServer = (req, resp) => {
  // Create decoder object.
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  var chunks = '';

  // Define router for handlers.
  var router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'menu': handlers.menu,
    'items': handlers.items
  };

  // Handle data event.  
  req.on('data', (data) => {
    chunks = decoder.write(data);
    buffer = chunks;
  });

  // Handler request-end event.
  req.on('end', () => {
    // Declare request data object.
    let reqData = {};

    // Process request url.
    let parsedUrl = url.parse(req.url, true);

    // Commit buffer data.
    buffer = decoder.end();
    reqData.payload = helpers.parseJSONtoObject(buffer);

    // Get request method.
    reqData.method = req.method.toLowerCase();

    // Get request headers.
    reqData.headers = req.headers;

    // Get url path.
    reqData.path = parsedUrl.pathname.replace(/^\/|\/$/g, '');

    // Get url querystring.
    reqData.query = parsedUrl.query;

    // Assign appropriate request handler.
    let requestHandler = typeof (router[reqData.path]) == 'undefined' ? handlers.notFound : router[reqData.path];

    // callback for request handler.
    requestHandler(reqData, (statusCode, payload) => {
      // Set default values.
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      payload = typeof (payload) == 'object' ? payload : {};

      // Update response object.
      resp.setHeader('Content-Type', 'application/json');
      resp.writeHead(statusCode);

      let payloadString = JSON.stringify(payload);
      resp.end(payloadString);
      console.log('\nRequest responed with ', statusCode, payloadString);
    });
  });
};

server.init = () => {
  // Implements encrypted server listner.
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(`HTTPS server is running on ${config.hostname}:${config.httpsPort}`);
  });

  // Implements server listner.
  server.httpServer.listen(config.httpPort, () => {
    console.log(`HTTP server is running on ${config.hostname}:${config.httpPort}`);
  });
};

// Exports module
module.exports = server;