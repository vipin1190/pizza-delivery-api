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
 * @param {callback} callback Response callback.
 */
file_explorer.create = (dir, filename, data, callback) => {
  fs.open(`${file_explorer.baseDir}${dir}/${filename}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      let stringifyFileData = JSON.stringify(data);
      fs.write(fd, stringifyFileData, (err) => {
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
 * @param {callback} callback Response callback.
 */
file_explorer.read = (dir, filename, callback) => {
  let requestFileLocation = `${file_explorer.baseDir}${dir}/${filename}.json`;
  if (fs.existsSync(requestFileLocation)) {
    fs.readFileSync(requestFileLocation, (err, data) => {
      if (!err && data) {
        callback(false, helpers.parseJSONtoObject(data));
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
  fs.open(`${file_explorer.baseDir}${dir}/${filename}.json`, 'r', (err, fd) => {
    if (!err && fd) {
      fs.truncate(fd, (err) => {
        if (!err) {
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

// Export module.
module.exports = file_explorer;