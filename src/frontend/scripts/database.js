import {
    Product
} from './internals.js';

let databaseIsReady = false;

const products = [];

export function registerProduct(pr) {
    if (pr instanceof Product) {
        if (products.includes(pr)) throw new Error(`Product "${pr.name}" already registered!`);
        products.push(pr);
    } else throw new Error("This is not a Product!");
}

export function getProduct(name) {
    return products.find(p => p.name === name);
}

export function processProdObjs(prods) {
    let out = [];
    for (const prodObj of prods) {
        let prod = Product.safeCreate(prodObj);
        out.push(prod);
    }
    return out;
}

export default {
    registerProduct,
    getProduct,
    processProdObjs
};