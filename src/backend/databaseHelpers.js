const database = require("./database");
const utils = require("./utils");
const unique = require("unique-token");
const mailHelpers = require("./mailHelpers");

async function removeExpiredTokens() {
    const now = Date.now();
    let dataTokens = (await database.tokens);
    const tokens = Object.entries(dataTokens.value())
    for (const [key, token] of tokens) {

        if (token.expires <= now) dataTokens = dataTokens.unset(key);
    }
    if (tokens.length > 0) await dataTokens.write();
    return;
}

async function removeExpiredActivations() {
    const now = Date.now();
    let dataMails = (await database.mailActivations);
    const mails = Object.entries(dataMails.value())
    for (const [key, token] of mails) {

        if (token.expires <= now) dataMails = dataMails.unset(key);
    }
    if (mails.length > 0) await dataMails.write();
    return;
}

async function removeNonActivatedUsers() {
    const lastReqDate = utils.addDays(Date.now(), -7).getTime();
    let dataUsers = (await database.users);
    let removedUserIDs = [];
    for (const [key, user] of Object.entries(dataUsers.value())) {
        if (!user.activated && user.dateCreated <= lastReqDate) {
            dataUsers = dataUsers.unset(key);
            removedUserIDs.push(key);
        }
    }
    if (removedUserIDs.length > 0) {
        await dataUsers.write();
        await removeUsersTokens(removedUserIDs);
        await removeUsersActivations(removedUserIDs);
    }
    return;
}

async function removeInactiveUsers() {
    const lastReqDate = utils.addYears(Date.now(), -1).getTime();
    let dataUsers = (await database.users);
    let removedUserIDs = [];
    for (const [key, user] of Object.entries(dataUsers.value())) {
        if (user.lastLogged <= lastReqDate) {
            dataUsers = dataUsers.unset(key);
            removedUserIDs.push(key);
        }
    }
    if (removedUserIDs.length > 0) {
        await dataUsers.write();
        await removeUsersTokens(removedUserIDs);
        await removeUsersActivations(removedUserIDs);
    }
    return
}

async function removeUsersTokens(IDs) {
    let dataTokens = (await database.tokens);
    for (const [key, token] of Object.entries(dataTokens.value())) {
        if (IDs.includes(token.userID)) dataTokens = dataTokens.unset(key);
    }
    await dataTokens.write();
}

async function removeUserTokens(ID) {
    let dataTokens = (await database.tokens);
    for (const [key, token] of Object.entries(dataTokens.value())) {
        if (token.userID === ID) dataTokens = dataTokens.unset(key);
    }
    await dataTokens.write();
}

async function removeUserActivations(ID) {
    let dataMails = (await database.mailActivations);
    for (const [key, token] of Object.entries(dataMails.value())) {
        if (token.userID === ID) {
            dataMails = dataMails.unset(key);
        }
    }
    await dataMails.write();
}

async function removeUsersActivations(IDs) {
    let dataActivations = (await database.mailActivations);
    for (const [key, activationToken] of Object.entries(dataActivations.value())) {
        if (IDs.includes(activationToken.userID)) dataActivations = dataActivations.unset(key);
    }
    await dataActivations.write();
}

async function removeUser(ID) {
    (await database.users).unset(ID).write();
    await removeUserTokens(ID);
    await removeUserActivations(ID);
}

async function createUser(userID, {
    email,
    password,
    nick
}) {
    const hashedPassword = await utils.passHash(password);
    const dateCreated = new Date().getTime();
    await (await database.users).set(userID)
        .set(userID + ".email", email)
        .set(userID + ".hashedPassword", hashedPassword)
        .set(userID + ".nick", nick)
        .set(userID + ".dateCreated", dateCreated)
        .set(userID + ".lastLogged", dateCreated)
        .set(userID + ".activated", false)
        .set(userID + ".favourites", [])
        .write();
    await sendActivationMail({ email, nick, userID });
}

async function sendActivationMail({ email, nick, userID }) {
    const activationToken = await createActivationToken(userID)
    await mailHelpers.sendActivationMail({
        mail: email,
        activationlink: "/api/activate/"+activationToken,
        nick: nick
    });
    await (await database.users).set(userID + ".emailSent", Date.now()).write();
}

async function isUser(ID) {
    return (await database.users).has(ID).value();
}

async function refreshToken(token) {
    if (typeof token === "undefined") return true; //token does not exists
    if (typeof token !== "string") return false; //wrong token
    token = token.trim();
    if ((await database.tokens).has(token).value()) {
        const newTime = utils.addMinutes(new Date(), 30).getTime();
        await (await database.tokens).set(token + ".expires", newTime).write();
        await updateUserLoginDate((await database.tokens).get(token + ".userID").value());
    } else return false; //token is invalid/expired
    return true;
}

async function updateUserLoginDate(userID) {
    await (await database.users).set(userID + ".lastLogged", Date.now()).write();
}

async function removeToken(token) {
    await (await database.tokens).unset(token).write();
}

async function getUser(ID) {
    return (await database.users).get(ID).value();
}

async function hasUserID(ID) {
    return (await database.users).has(ID).value();
}

async function hasUserEmail(email) {
    return await hasUserID(await utils.hash(email));
}

async function getHashedPass(ID) {
    return (await database.users).get(ID + ".hashedPassword").value();
}

async function getUserCopy(ID) {
    return Object.assign({}, await getUser(ID));
}

async function verifyToken(token) {
    if ((await database.tokens).has(token).value()) {
        return (await database.tokens).get(token + ".userID").value();
    } else return false;
}

async function updateUser(userID, {
    email,
    password,
    nick
}) {
    if (password) password = await utils.passHash(password);
    let activated = ((!email || (await database.users).get(userID + ".email").value() === email) && (await database.users).get(userID + ".activated").value());
    let oldMail = email || null;
    const dataUsers = (await database.users);
    await dataUsers.update(userID + ".email", utils.produceUpdater(email))
        .update(userID + ".hashedPassword", utils.produceUpdater(password))
        .update(userID + ".nick", utils.produceUpdater(nick))
        .update(userID + ".activated", activated).write();
    if (oldMail) {
        const newID = await utils.hash(email);
        await changeUserID(userID, newID);
        await transferTokens(userID, newID);
        await transferActivations(userID, newID);
    }
}

async function transferActivations(oldID, targetID) {
    let dataMails = (await database.mailActivations);
    for (const [key, token] of Object.entries(dataMails.value())) {
        if (token.userID === oldID) dataMails = dataMails.set(key + ".userID", targetID);
    }
    await dataMails.write();
}

async function transferTokens(oldID, targetID) {
    let dataTokens = (await database.tokens);
    for (const [key, token] of Object.entries(dataTokens.value())) {
        if (token.userID === oldID) dataTokens = dataTokens.set(key + ".userID", targetID);
    }
    await dataTokens.write();
}

async function changeUserID(oldID, newID) {
    const user = await getUser(oldID);
    (await database.users).unset(oldID).write();
    (await database.users).set(newID, user).write();
}

async function createToken(userID) {
    const newToken = unique.token();
    await (await database.tokens).set(newToken, {
        expires: utils.addMinutes(new Date(), 30).getTime(),
        userID: userID
    }).write();
    return newToken;
}

async function createActivationToken(userID) {
    const newToken = unique.token();
    await (await database.mailActivations).set(newToken, {
        expires: utils.addDays(new Date(), 2).getTime(),
        userID: userID
    }).write();
    return newToken;
}

async function prodMeta() {
    await (await database.products).map(async prod => {
        const validID = await utils.hashProd(prod.name);
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

async function getAllProducts() {
    return (await database.products);
}

async function getRandomProducts(num) {
     return await getAllProducts().shuffle().slice(0, num);
}

async function getRecentProducts(num) {
    return (await database.products).sortBy(["dateCreated"]).reverse().slice(0, num).reverse();
}

async function getCheapestProducts(num) {
    return (await database.products).sortBy(p => p.prices.PLN).slice(0, num);
}

async function activateUser(token) {
    const t = (await database.mailActivations).get(token).value();
    if (t && t.userID) {
        await (await database.users).set(t.userID + ".activated", true).write();
        await removeUserActivations(t.userID);
        return true;
    }
    return false;
}

async function isUserAwaitingActivation(userID) {
    const check = (await database.mailActivations).find(p => p.userID === userID).value();
    if (check) return true;
    return false;
}

async function getProduct(id) {
    return (await database.products).find(p => p.ID = id).value();
}

async function getProductByName(name) {
    const id = utils.hashProd(name);
    return await getProduct(id);
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
    sendActivationMail,
    getProduct,
    getProductByName
}