/**
 * Application server environment configurations.
 * @author
 *  vipin suthar
 * @description
 *  Application configuration environments for different servers, 
 *  i.e. Staging, UAT, Production.
 */

// Declare variables.
const envrionments = {};

// Staging environment properties.
envrionments.staging = {
  'envName': 'Staging',
  'hostname': 'localhost',
  'httpPort': 3000,
  'httpsPort': 3001,
  'hashSecret': 'PDAStaging',
  'settings': {
    'mailgun': {
      'hostname': 'api.mailgun.net',
      'path': '/v3/{DOMAIN_ID}',
      'username': 'api',
      'apiKey': '{API_KEY}',
      'from': '{FROM_USER}'
    },
    'stripe': {
      'hostname': 'api.stripe.com',
      'path': '/v1/',
      'secretKey': '{SECRET_KEY}',
      'password': '',
      'currency': 'gbp'
    }
  }
};

// Production environment properties.
envrionments.prod = {
  'envName': 'Production',
  'hostname': 'localhost',
  'httpPort': 5000,
  'httpsPort': 5001,
  'hashSecret': 'PDAProd',
  'settings': {
    'mailgun': {
      'hostname': 'api.mailgun.net',
      'path': '/v3/{DOMAIN_ID}',
      'username': 'api',
      'apiKey': '{API_KEY}',
      'from': '{FROM_USER}'
    },
    'stripe': {
      'hostname': 'api.stripe.com',
      'path': '/v1/',
      'secretKey': '{SECRET_KEY}',
      'password': '',
      'currency': 'gbp'
    }
  }
};

// Get currently active environment.
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Get server environment object.
const envirnomentToExport = typeof (envrionments[currentEnvironment]) == 'object' ? envrionments[currentEnvironment] : envrionments.staging;

// Exports module.
module.exports = envirnomentToExport;