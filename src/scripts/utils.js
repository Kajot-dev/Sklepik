export const pricesVal = {
    "PLN": 1,
    "EUR": 0.22,
    "USD": 0.27
}



export function convertPrice(source, target, ammount) {
    if (!pricesVal.hasOwnProperty(source) || !pricesVal.hasOwnProperty(target)) throw new Error(`Either ${source} or ${target} currency is unsupported!`);
    const total = (pricesVal[target] / pricesVal[source]) * ammount;
    return ~~(total * 100) / 100;
}

function autocompletePrices(obj) {

}

/**
 * @description Do użwania razem z sort(), alfabetycznie
 * @param {string} a 
 * @param {string} b 
 * @return -1 | 1 | 0
 */
export function sortAlphabetically(a, b) {
    let e1 = a.toUpperCase();
    let e2 = b.toUpperCase();
    if (e1[0] < e2[0]) return -1;
    else if (e1[0] > e2[0]) return 1;
    else return 0;
}


/**
 * @description Do użwania razem z sort() po dacie
 * @param {Date} a 
 * @param {Date} b 
 * @return -1 | 1 | 0
 */
export function sortByDate(a, b) {
    let e1 = a.getTime();
    let e2 = b.getTime();
    if (e1[0] < e2[0]) return -1;
    else if (e1[0] > e2[0]) return 1;
    else return 0;
}

/**
 * @description Do użwania razem z sort() po dacie (string)
 * @param {Date} a 
 * @param {Date} b 
 * @return -1 | 1 | 0
 */
export function sortByDateString(a, b) {
    let e1 = new Date(a).getTime();
    let e2 = new Date(b).getTime();
    if (e1[0] < e2[0]) return -1;
    else if (e1[0] > e2[0]) return 1;
    else return 0;
}

export function createEntries(prop, ...objects) {
    objects = objects.map(o => [o[prop], o]);
    return objects;
}

export function createPropEntries(props, ...objects) {
    let output = [];
    for (let o of objects) {
        let p = o;
        for (let prop of props) p = p[prop];
        output.push([p, o]);
    }
    return output;
}

export function unpackEntriesObj(entries) {
    entries = entries.map(e => e[1]);
    return entries;
}

export function autoSort(a, b) {
    if (typeof a == "undefined" || typeof b == "undefined") return 0;
    else if (a instanceof String && b instanceof String) return sortAlphabetically(a, b);
    else if (a instanceof Date && b instanceof Date) return sortByDate(a, b);
    else return 0;
}

export function hash(str, seed = 0) {
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

export class EventEmitter {
    constructor() {
        return this;
    }
    emitFunctions = new Map();
    onceEmit = new Map();
    on(name, handler) {
        if (this.emitFunctions.has(name)) {
            let ar = this.emitFunctions.get(name);
            this.emitFunctions.set(name, ar.push(handler));
        } else this.emitFunctions.set(name, [handler]);

    }
    once(name, handler) {
        if (this.onceEmit.has(name)) {
            let ar = this.onceEmit.get(name);
            this.onceEmit.set(name, ar.push(handler));
        } else this.onceEmit.set(name, [handler]);
    }
    emit(name, ...args) {
        if (this.emitFunctions.has(name)) {
            for (let h of this.emitFunctions.get(name)) h.call(h, ...args);
        }
        if (this.onceEmit.has(name)) {
            for (let h of this.onceEmit.get(name)) h.call(h, ...args);
            this.onceEmit.delete(name);
        }
    }
    off(name) {
        if (this.emitFunctions.has(name)) this.emitFunctions.delete(name);
        if (this.onceEmit.has(name)) this.onceEmit.delete(name);
    }
}

export default {
    sortByDate,
    sortAlphabetically,
    sortByDateString,
    createEntries,
    createPropEntries,
    unpackEntriesObj,
    autoSort,
    convertPrice,
    hash,
    EventEmitter,
    pricesVal
};