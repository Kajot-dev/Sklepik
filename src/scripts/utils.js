


const pricesVal = {
    "PLN": 1,
    "EUR": 0.22,
    "USD": 0.27
}



function convertPrice(source, target, ammount) {
    if (!pricesVal.hasOwnProperty(source) || !pricesVal.hasOwnProperty(target)) throw new Error(`Either ${source} or ${target} currency is unsupported!`);

}

function autocompletePrices(obj) {
    
}

/**
 * @description Do użwania razem z sort(), alfabetycznie
 * @param {string} a 
 * @param {string} b 
 * @return -1 | 1 | 0
 */
function sortAlphabetically(a, b) {
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
function sortByDate(a, b) {
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
function sortByDateString(a, b) {
    let e1 = new Date(a).getTime();
    let e2 = new Date(b).getTime();
    if (e1[0] < e2[0]) return -1;
    else if (e1[0] > e2[0]) return 1;
    else return 0;
}

function createEntries(prop, ...objects) {
    objects = objects.map(o => [o[prop], o]);
    return objects;
}
function createPropEntries(props, ...objects) {
    let output = [];
    for (let o of objects) {
        let p = o;
        for (let prop of props) p = p[prop];
        output.push([p, o]);
    }
    return output;
}
function unpackEntriesObj(entries) {
    entries = entries.map(e => e[1]);
    return entries;
}

function autoSort(a, b) {
    if (typeof a == "undefined" || typeof b == "undefined") return 0;
    else if (a instanceof String && b instanceof String) return sortAlphabetically(a, b);
    else if (a instanceof Date && b instanceof Date) return sortByDate(a, b);
    else return 0;
}

export default {
    sortByDate,
    sortAlphabetically,
    sortByDateString,
    createEntries,
    createPropEntries,
    unpackEntriesObj,
    autoSort
};