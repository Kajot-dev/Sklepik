import { Product } from './internals.js';
import Utils from "./utils.js"
//tutaj będzie "sztuczna" baza danych (przechowywana w cookies) oraz w plikach JSON

let databaseIsReady = false;

const products = [];


export function registerProduct(pr) {
    if (pr instanceof Product) {
        if (products.includes(pr.name)) throw new Error(`Product "${pr.name}" already registered!`);
        products.push(pr);
    } else throw new Error("This is not a Product!");
}

export function getProduct(name) {
    let h = Utils.hash(name);
    return products.find(p => p.name === h);
}

export function processProdObjs(prods) {
    let out = [];
    for (const prodObj of prods) {
        out.push(Product.safeCreate(prodObj));
    }
    return out;
}

export default { registerProduct, getProduct, processProdObjs };