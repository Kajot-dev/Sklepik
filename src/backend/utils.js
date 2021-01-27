const path = require('path');
const fs = require('fs');
const fsPromises = require("fs").promises;
const crypto = require('crypto');
const database = require("./database");
const {
    config
} = database;

//Constants
const chars = /[0-9]/;
const special = /[!@#$%^&*\?]/;

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const pricesVal = {
    "PLN": 1,
    "EUR": 0.22,
    "USD": 0.27
}

function convertPrice(source, target, ammount) {
    if (!pricesVal.hasOwnProperty(source) || !pricesVal.hasOwnProperty(target)) throw new Error(`Either ${source} or ${target} currency is unsupported!`);
    const total = (pricesVal[target] / pricesVal[source]) * ammount;
    return ~~(total * 100) / 100;
}

function completePrices(pricesObj) {
    let main = Object.keys(pricesObj).find(p => p in pricesVal);
    if (main) {
        for (let p of Object.keys(pricesVal)) {
            if (!(p in pricesObj)) {
                pricesObj[p] = convertPrice(main, p, pricesObj[main]);
            }
        }
    }
    return pricesObj;
}

function hasExtension(filePath) {
    return path.extname(filePath) !== "";
}

function isEmail(mail) {
    return stringHelper(mail, {
        checkPattern: emailRegex
    });
}

function doesExist(filePath) {
    return new Promise((resolve, reject) => {
        fsPromises.access(filePath, fs.constants.R_OK).then(() => resolve(true)).catch(() => resolve(false));
    });
}

function stringHelper(stringsArray, opts) {
    //Destruct config object
    let {
        minL,
        maxL,
        reqSpecialChars,
        reqNumbers,
        checkPattern
    } = opts;
    //Create an array if needed
    stringsArray = stringsArray instanceof Array ? stringsArray : [stringsArray];
    //Process strings
    for (let s of stringsArray) {
        //Type check
        if (typeof s != "string") return false;
        s = s.trim();
        //Check for RegExp
        if (checkPattern instanceof RegExp) {
            let ans = checkPattern.exec(s);
            if (!ans || ans[0] != s) return false;
        } else {
            //If RegExp is not present, proceed to regular checking
            if (typeof minL == "number" && s.length < minL) return false;
            if (typeof maxL == "number" && s.length > maxL) return false;
            if (reqNumbers && !chars.test(s)) return false;
            if (reqSpecialChars && !special.test(s)) return false;
        }
    }
    return true;
}

async function hash(str) {
    const seed = (await config).get("hashingSecret").value();
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const h = [h2 >>> 0, h1 >>> 0].join("")
    return h;
}

async function hashProd(str) {
    const seed = 0;
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const h = [h2 >>> 0, h1 >>> 0].join("")
    return h;
}

function random(min, max) {
    return ~~(Math.random() * (max - min + 1) + min);
}

async function passHash(str) {
    if (typeof str != "string" || str.length == 0) return false;
    let h = crypto.createHmac("sha256", (await config).get("passSecret").value()).update(str).digest("hex");
    return h;
}

function addMinutes(date, minutes) {
    if (typeof date == "number") date = new Date(date);
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}

function addYears(date, years) {
    if (typeof date == "number") date = new Date(date);
    date.setFullYear(date.getFullYear() + years);
    return date;
}

function addDays(date, days) {
    if (typeof date == "number") date = new Date(date);
    date.setDate(date.getDate() + days);
    return date;
}

function produceUpdater(newVal) {
    return function (val) {
        if (typeof newVal === "undefined" || newVal === null) newVal = val;
        return newVal;
    }
}

module.exports = {
    hasExtension,
    doesExist,
    stringHelper,
    random,
    hash,
    passHash,
    addMinutes,
    isEmail,
    addYears,
    addDays,
    produceUpdater,
    completePrices,
    convertPrice,
    hashProd
};