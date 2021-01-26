const database = require("./database");
const utils = require("./utils");
const unique = require("unique-token");
const mailHelpers = require("./mailHelpers");

function removeExpiredTokens() {
    const now = Date.now();
    let dataTokens = database.tokens;
    const tokens = Object.entries(dataTokens.value())
    for (const [key, token] of tokens) {

        if (token.expires <= now) dataTokens = dataTokens.unset(key);
    }
    if (tokens.length > 0) dataTokens.write();
}

function removeExpiredActivations() {
    const now = Date.now();
    let dataMails = database.mailActivations;
    const mails = Object.entries(dataMails.value())
    for (const [key, token] of mails) {

        if (token.expires <= now) dataMails = dataMails.unset(key);
    }
    if (mails.length > 0) dataMails.write();
}

function removeNonActivatedUsers() {
    const lastReqDate = utils.addDays(Date.now(), -7).getTime();
    let dataUsers = database.users;
    let removedUserIDs = [];
    for (const [key, user] of Object.entries(dataUsers.value())) {
        if (!user.activated && user.dateCreated <= lastReqDate) {
            dataUsers = dataUsers.unset(key);
            removedUserIDs.push(key);
        }
    }
    if (removedUserIDs.length > 0) {
        dataUsers.write();
        removeUsersTokens(removedUserIDs);
        removeUsersActivations(removedUserIDs);
    }
}

function removeInactiveUsers() {
    const lastReqDate = utils.addYears(Date.now(), -1).getTime();
    let dataUsers = database.users;
    let removedUserIDs = [];
    for (const [key, user] of Object.entries(dataUsers.value())) {
        if (user.lastLogged <= lastReqDate) {
            dataUsers = dataUsers.unset(key);
            removedUserIDs.push(key);
        }
    }
    if (removedUserIDs.length > 0) {
        dataUsers.write();
        removeUsersTokens(removedUserIDs);
        removeUsersActivations(removedUserIDs);
    }
}

function removeUsersTokens(IDs) {
    let dataTokens = database.tokens;
    for (const [key, token] of Object.entries(dataTokens.value())) {
        if (IDs.includes(token.userID)) dataTokens = dataTokens.unset(key);
    }
    dataTokens.write();
}

function removeUserTokens(ID) {
    let dataTokens = database.tokens;
    for (const [key, token] of Object.entries(dataTokens.value())) {
        if (token.userID === ID) dataTokens = dataTokens.unset(key);
    }
    dataTokens.write();
}

function removeUserActivations(ID) {
    let dataMails = database.mailActivations;
    for (const [key, token] of Object.entries(dataMails.value())) {
        if (token.userID === ID) dataMails = dataMails.unset(key);
    }
    dataMails.write();
}

function removeUsersActivations(IDs) {
    let dataActivations = database.mailActivations;
    for (const [key, activationToken] of Object.entries(dataActivations.value())) {
        if (IDs.includes(activationToken.userID)) dataActivations = dataActivations.unset(key);
    }
    dataActivations.write();
}

function removeUser(ID) {
    database.users.unset(ID).write();
    removeUserTokens(ID);
    removeUserActivations(ID);
}

function createUser(userID, {
    email,
    password,
    nick
}) {
    const hashedPassword = utils.passHash(password);
    const dateCreated = new Date().getTime();
    database.users.set(userID)
        .set(userID + ".email", email)
        .set(userID + ".hashedPassword", hashedPassword)
        .set(userID + ".nick", nick)
        .set(userID + ".dateCreated", dateCreated)
        .set(userID + ".lastLogged", dateCreated)
        .set(userID + ".activated", false)
        .set(userID + ".favourites", [])
        .write();
        sendActivationMail({ email, nick, userID });
}

function sendActivationMail({ email, nick, userID }) {
    const activationToken = createActivationToken(userID)
    mailHelpers.sendActivationMail({
        mail: email,
        activationlink: "/api/activate/"+activationToken,
        nick: nick
    }).then(() => {
        database.users.set(userID + ".emailSent", Date.now()).write();
    }).catch(e => console.error(e));
}

function isUser(ID) {
    return database.users.has(ID).value();
}

function refreshToken(token) {
    if (typeof token === "undefined") return true; //token does not exists
    if (typeof token !== "string") return false; //wrong token
    token = token.trim();
    if (database.tokens.has(token).value()) {
        const newTime = utils.addMinutes(new Date(), 30).getTime();
        database.tokens.set(token + ".expires", newTime).write();
        updateUserLoginDate(database.tokens.get(token + ".userID").value());
    } else return false; //token is invalid/expired
    return true;
}

function updateUserLoginDate(userID) {
    database.users.set(userID + ".lastLogged", Date.now()).write();
}

function removeToken(token) {
    database.tokens.unset(token).write();
}

function getUser(ID) {
    return database.users.get(ID).value();
}

function hasUserID(ID) {
    return database.users.has(ID).value();
}

function hasUserEmail(email) {
    return hasUserID(utils.hash(email));
}

function getHashedPass(ID) {
    return database.users.get(ID + ".hashedPassword").value();
}

function getUserCopy(ID) {
    return Object.assign({}, getUser(ID));
}

function verifyToken(token) {
    if (database.tokens.has(token).value()) {
        return database.tokens.get(token + ".userID").value();
    } else return false;
}

function updateUser(userID, {
    email,
    password,
    nick
}) {
    if (password) password = utils.passHash(password);
    let activated = ((!email || database.users.get(userID + ".email").value() === email) && database.users.get(userID + ".activated").value());
    let oldMail = email || null;
    const dataUsers = database.users;
    dataUsers.update(userID + ".email", utils.produceUpdater(email))
        .update(userID + ".hashedPassword", utils.produceUpdater(password))
        .update(userID + ".nick", utils.produceUpdater(nick))
        .update(userID + ".activated", activated).write();
    if (oldMail) {
        const newID = utils.hash(email);
        changeUserID(userID, newID);
        transferTokens(userID, newID);
        transferActivations(userID, newID);
    }
}

function transferActivations(oldID, targetID) {
    let dataMails = database.mailActivations;
    for (const [key, token] of Object.entries(dataMails.value())) {
        if (token.userID === oldID) dataMails = dataMails.set(key + ".userID", targetID);
    }
    dataMails.write();
}

function transferTokens(oldID, targetID) {
    let dataTokens = database.tokens;
    for (const [key, token] of Object.entries(dataTokens.value())) {
        if (token.userID === oldID) dataTokens = dataTokens.set(key + ".userID", targetID);
    }
    dataTokens.write();
}

function changeUserID(oldID, newID) {
    const user = getUser(oldID);
    database.users.unset(oldID).write();
    database.users.set(newID, user).write();
}

function createToken(userID) {
    const newToken = unique.token();
    database.tokens.set(newToken, {
        expires: utils.addMinutes(new Date(), 30).getTime(),
        userID: userID
    }).write();
    return newToken;
}

function createActivationToken(userID) {
    const newToken = unique.token();
    database.mailActivations.set(newToken, {
        expires: utils.addDays(new Date(), 2).getTime(),
        userID: userID
    }).write();
    return newToken;
}

function prodMeta() {
    database.products.map(prod => {
        const validID = utils.hash(prod.name);
        if (typeof prod.ID !== "string" || prod.ID !== validID) {
            prod.ID = validID;
        }
        prod.prices = utils.completePrices(prod.prices);
        if (typeof prod.dateCreated === "string") {
            prod.dateCreated = new Date(prod.dateCreated).getTime();
        } else if (typeof prod.dateCreated === "undefined") {
            prod.dateCreated = Date.now();
        }
        if (typeof prod.watched !== "number") prod.watched = 0;
        if (typeof prod.buyed !== "number") prod.buyed = 0;
        return prod;
    }).write();
}

function getAllProducts() {
    return database.products;
}

function getRandomProducts(num) {
     return getAllProducts().shuffle().slice(0, num);
}

function getRecentProducts(num) {
    return database.products.sortBy(["dateCreated"]).reverse().slice(0, num).reverse();
}

function getCheapestProducts(num) {
    return database.products.sortBy(p => p.prices.PLN).slice(0, num);
}

function activateUser(token) {
    const t = database.mailActivations.get(token).value();
    console.log(t);
    if (t && t.userID) {
        database.users.set(t.userID + ".activated", true).write();
        removeUserActivations(t.userID);
        return true;
    }
    return false;
}

function isUserAwaitingActivation(userID) {
    const check = database.mailActivations.find(p => p.userID === userID).value();
    if (check) return true;
    return false;
}
module.exports = {
    removeExpiredTokens,
    removeNonActivatedUsers,
    removeInactiveUsers,
    removeUsersTokens,
    removeUserTokens,
    removeUser,
    refreshToken,
    createUser,
    isUser,
    removeToken,
    getUser,
    getHashedPass,
    createToken,
    updateUserLoginDate,
    verifyToken,
    updateUser,
    hasUserID,
    changeUserID,
    transferTokens,
    hasUserEmail,
    getUserCopy,
    getAllProducts,
    getRandomProducts,
    getRecentProducts,
    getCheapestProducts,
    prodMeta,
    removeExpiredActivations,
    createActivationToken,
    removeUserActivations,
    removeUsersActivations,
    transferActivations,
    activateUser,
    isUserAwaitingActivation,
    sendActivationMail
}