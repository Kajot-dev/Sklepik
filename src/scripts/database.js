import { Product } from './internals.js';
import Utils from "./utils.js"
//tutaj będzie "sztuczna" baza danych (przechowywana w cookies) oraz w plikach JSON

const database = {
    products: {}
}


function init() {

    
}

export async function loadProducts() {
    let products = await fetch("/database/products.json");
    if (!products.ok) throw new Error("Error loading products!");
    products = await products.json();
    let output = [];
    for (let p of products) {
        output.push(Product.safeCreate(p));
    }
    return output;
}

export function getAllProducts() {
    return Object.values(database.products);
}

export function hasProductByName(name) {
    let h = Utils.hash(name);
    if (h in database.products) return true;
    return false;
}

export function registerProduct(pr) {
    if (pr instanceof Product) {
        let h = Utils.hash(pr.name);
        if (h in database.products) throw new Error(`Product "${pr.name}" already registered!`);
        database.products[h] = pr;
    } else throw new Error("This is not a Product!");
}

export function getProduct(name) {
    let h = Utils.hash(name);
    return database.products[h];
}

export default { loadProducts, getAllProducts, hasProductByName, registerProduct, getProduct };