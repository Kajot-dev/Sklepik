const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const path = require('path');
const unique = require('unique-token');
const uniqueOpts = {
    length: 15
};

function random(min, max) {
    return ~~(Math.random() * (max - min + 1) + min);
}

//paths
const databasePath = path.join(__dirname, 'database');


//config
const config = low(new FileAsync(path.join(databasePath, "config.json")));



//users
const users = low(new FileAsync(path.join(databasePath, "users.json")));


//tokens
const tokens = low(new FileAsync(path.join(databasePath, "tokens.json")));


//products
const products = low(new FileAsync(path.join(databasePath, "products.json")));


//emailActivations
const mailActivations = low(new FileAsync(path.join(databasePath, "emailActivations.json")));



async function defs() {
    (await users).defaults({}).write();
    (await tokens).defaults({}).write();
    (await products).defaults([]).write();
    (await mailActivations).defaults({}).write();
    const configData = (await config).value();
    configData.sessionSecret = configData.sessionSecret || unique.random(uniqueOpts);
    configData.sessionName = configData.sessionName || unique.random(uniqueOpts);
    configData.hashingSecret = configData.hashingSecret || random(1, 100);
    configData.passSecret = configData.passSecret || unique.random(uniqueOpts);
    await (await config).set(configData).write();
}

defs();
module.exports = {
    config,
    users,
    tokens,
    products,
    mailActivations
};