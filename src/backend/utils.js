const path = require('path');
const fs = require('fs');
const fsPromises = require("fs").promises;

function hasExtension(filePath) {
    return path.extname(filePath) !== "";
}

function doesExist(filePath) {
    return new Promise((resolve, reject) => {
        fsPromises.access(filePath, fs.constants.R_OK).then(() => resolve(true)).catch(() => resolve(false));
    });
}

module.exports = { hasExtension, doesExist };