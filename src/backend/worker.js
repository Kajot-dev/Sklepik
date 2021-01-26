const databaseHelpers = require('./databaseHelpers');

function init() {
    databaseHelpers.removeExpiredTokens();
    databaseHelpers.removeNonActivatedUsers();
    databaseHelpers.removeInactiveUsers();
    databaseHelpers.prodMeta();
    setInterval(() => {
        databaseHelpers.removeExpiredTokens();
    }, 1000 * 60); //co minutę
    setInterval(() => {
        databaseHelpers.removeNonActivatedUsers();
        databaseHelpers.removeInactiveUsers();
        databaseHelpers.prodMeta();
    }, 1000 * 60 * 60); //co minutę
}


module.exports = { init };