/**
 * @file
 *  File Operations Manager.
 * @author
 *  vipin suthar
 * @description
 *  Provides operations for basic CRUD file operations.
 */

// Import modules.
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Declare variables.
const file_explorer = {};
file_explorer.baseDir = path.join(__dirname, '../.data/');

/**
 * Create new JSON file to the directory system.
 * 
 * @param {string} dir Name of the directory location where file to be created.
 * @param {string} filename Name of the file to be created.
 * @param {object} data An object of file content.
 * @param {string} extension A valid file extension.
 * @param {callback} callback Response callback.
 */
file_explorer.create = (dir, filename, data, extension, callback) => {
  // Verify if extension may be callback.
  if (typeof extension === 'function') {
    callback = extension;
    extension = 'json';
  }

  // Open file in write mode.
  fs.open(`${file_explorer.baseDir}${dir}/${filename}.${extension}`, 'wx', (err, fd) => {
    if (!err && fd) {
      let FileData = (extension == 'json') ? JSON.stringify(data) : data;

      // Write to file.
      fs.write(fd, FileData, (err) => {
        if (!err) {
          fs.close(fd, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback(`Failed to close the created file.`);
            }
          });
        } else {
          callback(`Failed while writing to the file.`);
        }
      });
    } else {
      callback(`Could not create file '${filename}', It may already exists!`);
    }
  });
};

/**
 * Read JSON file from the directory system.
 * 
 * @param {string} dir Name of the directory location where file to be created.
 * @param {string} filename Name of the file to be created.
 * @param {string} extension A valid file extension.
 * @param {callback} callback Response callback.
 */
file_explorer.read = (dir, filename, extension, callback) => {
  var options = { encoding: 'utf8' };
  // Verify if extension may be callback.
  if (typeof extension === 'function') {
    callback = extension;
    extension = 'json';
    options = { flag: 'r' };
  }

  let requestFileLocation = `${file_explorer.baseDir}${dir}/${filename}.${extension}`;
  if (fs.existsSync(requestFileLocation)) {
    // Read file.
    fs.readFile(requestFileLocation, options, (err, data) => {
      if (!err && data) {
        let readData = (extension == 'json') ? helpers.parseJSONtoObject(data) : data;
        callback(false, readData);
      } else {
        callback(err, data);
      }
    });
  } else {
    callback(`Requested file ${filename} does not exists.`);
  }
};

/**
 * Update file on the directory system.
 * 
 * @param {string} dir Name of the directory location where file to be created.
 * @param {string} filename Name of the file to be created.
 * @param {object} data An object of file content.
 * @param {callback} callback Response callback.
 */
file_explorer.update = (dir, filename, data, callback) => {
  // Open file in append mode.
  fs.open(`${file_explorer.baseDir}${dir}/${filename}.json`, 'r+', (err, fd) => {
    if (!err && fd) {
      // Truncate existing file data.
      fs.truncate(fd, (err) => {
        if (!err) {
          // Update file with new data object.
          fs.writeFile(fd, JSON.stringify(data), (err) => {
            if (!err) {
              callback(false);
            } else {
              callback(`Failed to update ${filename}`);
            }
          });
        } else {
          callback(`Please check file permissions`);
        }
      });
    } else {
      callback(`Requested file ${filename} does not exists.`);
    }
  });
};

/**
 * Removes JSON file from the directory system.
 * 
 * @param {string} dir Name of the directory location where file to be created.
 * @param {string} filename Name of the file to be created.
 * @param {callback} callback Response callback.
 */
file_explorer.delete = (dir, filename, callback) => {
  // Remove file from directory.
  fs.unlink(`${file_explorer.baseDir}${dir}/${filename}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(`Failed to delete ${filename}`);
    }
  });
};

/**
 * Explore directory system for files.
 * 
 * @param {string} dir Name of the directory location where file to be created.
 * @param {callback} callback Response callback.
 */
file_explorer.list = (dir, callback) => {
  // Read directory location.
  fs.readdir(`${file_explorer.baseDir}${dir}`, (err, files) => {
    if (!err && files && files.length > 0) {
      var trimmedFileNames = new Array();
      files.each((file) => {
        trimmedFileNames.push(file.replace('.json', ''));
      });
    } else {
      callback(err, files);
    }
  });
};

/**
 * Check if a file exists in directory or not.
 * 
 * @param {string} dir Name of the directory location where file to be created.
 * @param {string} filename Name of the file to be created.
 * @param {callback} callback Response callback.
 */
file_explorer.exists = (dir, filename, callback) => {
  let requestFileLocation = `${file_explorer.baseDir}${dir}/${filename}.json`;
  if (fs.existsSync(requestFileLocation)) {
    callback(true);
  } else {
    callback(false);
  }
};

// Export module.
module.exports = file_explorer;