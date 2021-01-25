const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const unique = require('unique-token');
const uniqueOpts = { length: 15 };

function random(min, max) {
    return ~~(Math.random() * (max - min + 1) + min);
}

//paths
const databasePath = path.join(__dirname, 'database');


//config
const config = low(new FileSync(path.join(databasePath, "config.json")));
config.defaults({}).write();
const configData = config.value();
configData.sessionSecret = configData.sessionSecret || unique.random(uniqueOpts);
configData.hashingSecret = configData.hashingSecret || random(1, 100);
configData.passSecret = configData.passSecret || unique.random(uniqueOpts);
config.set(configData).write();

//users
const users = low(new FileSync(path.join(databasePath, "users.json")));
users.defaults({}).write();

//tokens
const tokens = low(new FileSync(path.join(databasePath, "tokens.json")));
tokens.defaults({}).write();


module.exports = { config, users, tokens };