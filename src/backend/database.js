const low = require('lowdb');
const FileAsync = require('./realAsyncAdapter');
const path = require('path');
const unique = require('unique-token');
const cluster = require('cluster');
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
    await (await users).defaults({}).write();
    await (await tokens).defaults({}).write();
    await (await products).defaults([]).write();
    await (await mailActivations).defaults({}).write();
    const configData = (await config).value();
    configData.sessionSecret = configData.sessionSecret || unique.random(uniqueOpts);
    configData.sessionName = configData.sessionName || unique.random(uniqueOpts);
    configData.hashingSecret = configData.hashingSecret || random(1, 100);
    configData.passSecret = configData.passSecret || unique.random(uniqueOpts);
    await (await config).set(configData).write();
}

if (cluster.isMaster) defs();

module.exports = {
    config,
    users,
    tokens,
    products,
    mailActivations
};