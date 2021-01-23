const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

//paths
const databasePath = path.join(__dirname, 'database');
const configPath = path.join(databasePath, "config.json")

//config
const config = low(new FileSync(configPath));
config.defaults({ sessionSecret: "xyz", httpPort: 80}).write();

module.exports = { config };