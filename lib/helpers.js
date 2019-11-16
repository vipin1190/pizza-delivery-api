/**
 * Helper Library
 * @author
 *  vipin suthar
 * @description
 *  This library Defines the functions which  used within application,
 *  like third party library integration, functionality configurations, functions used repeatedly.
 */

// Declare variables.
const helpers = {};

// Convert string to object.
helpers.parseJSONtoObject = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
};

// Exports module.
module.exports = helpers;