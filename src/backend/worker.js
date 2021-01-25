const databaseHelpers = require('./databaseHelpers');

function init() {
    databaseHelpers.removeExpiredTokens();
    databaseHelpers.removeNonActivatedUsers();
    databaseHelpers.removeInactiveUsers();
    setInterval(() => {
        databaseHelpers.removeExpiredTokens();
    }, 1000 * 60); //co minutę
    setInterval(() => {
        databaseHelpers.removeNonActivatedUsers();
        databaseHelpers.removeInactiveUsers();
    }, 1000 * 60 * 60); //co godzinę
}


module.exports = { init };