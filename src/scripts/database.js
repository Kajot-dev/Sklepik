import { Product } from './internals.js';

//tutaj będzie "sztuczna" baza danych (przechowywana w cookies) oraz w plikach JSON

const database = {

}


function init() {

    
}

export async function loadProducts() {
    let products = await fetch("/database/products.json");
    if (!products.ok) throw new Error("Error loading products!");
    products = await products.json();
    database.products = [];
    for (let p of products) {
        database.products.push(Product.safeCreate(p));
    }
    return database.products;
}

export async function getAllProducts() {
    return database.products;
}

export default { loadProducts, getAllProducts };