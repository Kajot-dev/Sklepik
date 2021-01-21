import { Product } from './internals.js';
import Utils from "./utils.js"
//tutaj będzie "sztuczna" baza danych (przechowywana w cookies) oraz w plikach JSON

let databaseIsReady = false;

const database = {
    products: {}
}

let awaitingTasks = [];

export async function init() {
    let products = await fetch("/database/products.json");
    if (!products.ok) throw new Error("Error loading products!");
    products = await products.json();
    for (let p of products) new Product(p); //product will automatically register in database
    databaseIsReady = true;
    for (let t of awaitingTasks) {
        t.call(t)
    }
    awaitingTasks = [];
}

export function isReady() {
    return new Promise((resolve, reject) => {
        if (databaseIsReady) return resolve(true);
        else {
            awaitingTasks.push(resolve);
        }
    })
}

export function getAllProducts() {
    return Object.values(database.products);
}

export function getRecentProducts(num = 3) {
    const products = getAllProducts();
    let sorted = Utils.sortByProps(Utils.sortByDate, ["dateCreated"], ...products).reverse();
    return sorted.slice(0, num);
}

export function getRandomProducts(num = 1) {
    let output = [];
    let products = getAllProducts();
    for (let i = 0; i < num; i++) {
        if (products.length == 0) break;
        let chosen = Utils.randomInt(0, products.length-1);
        output.push(products[chosen]);
        products.splice(chosen, 1);
    }
    return output;
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

export default { isReady, getAllProducts, hasProductByName, registerProduct, getProduct, init, getRecentProducts };