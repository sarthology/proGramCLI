'use strict';

// NATIVE IMPORTS
const fs = require('fs');

/**
 * This is a wrapper function for the `fs` module's `readFile` function.
 * @param {string} file - The path to the file to be read
 * @returns {string} The data read from the file
 */
function readFileSync(file) {
	return fs.readFileSync(file, { encoding: 'utf8' });
}

module.exports = readFileSync;
