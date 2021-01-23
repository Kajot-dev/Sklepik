import Utils from "./utils.js";
import database from "./database.js";
const { EventEmitter } = Utils;
const productsBase = {};


export class Product {
    name;
    prices;
    dateCreated;
    imageLink;
    events = new EventEmitter();
    constructor({ name, prices, imageLink, dateCreated }) {
        if (!name) throw new Error("Name is required!");
        //we don't fire events in constructor
        this.name = name;
        this.prices = prices;
        this.imageLink = imageLink;
        if (typeof dateCreated === "string") this.dateCreated = new Date(dateCreated);
        else if (dateCreated instanceof Date) this.dateCreated = dateCreated;
        else this.dateCreated = new Date();
        const Aprices = Object.keys(this.prices);
        if (Aprices.length !== 0) {
            let main = Aprices.find(p => p in Utils.pricesVal);
            if (main) {
                for (let p of Object.keys(Utils.pricesVal)) {
                    if (!(p in this.prices)) {
                        this.prices[p] = Utils.convertPrice(main, p, this.prices[main]);
                    }
                }
            }
        }
        database.registerProduct(this);
    }
    autocompletePrices() {
        const Aprices = Object.keys(this.prices);
        if (Aprices.length !== 0) {
            let main = Aprices.find(p => p in Utils.pricesVal);
            if (main) {
                for (let p of Object.keys(Utils.pricesVal)) {
                    if (!(p in this.prices)) {
                        this.prices[p] = Utils.convertPrice(main, p, this.prices[main]);
                    }
                }
            }
        }
    }
    updateInfo({ prices, imageLink , dateCreated}) {
        if (prices) this.updatePrice(prices);
        if (imageLink) this.updateImage(imageLink);
        if (dateCreated) this.updateDate(dateCreated);
    }
    updatePrice(prices) {
        this.prices = prices;
        this.autocompletePrices();
        this.events.emit("priceUpdate");
    }
    updateImage(imageLink) {
        this.imageLink = imageLink;
        this.events.emit("imageUpdate");
    }
    updateDate(date) {
        if (date instanceof Date) this.dateCreated = date;
        else if (typeof date === "string") this.dateCreated = new Date(date);
        else throw new Error("This object is nor a String or a Date!");
    }
    updateCurrency() {
        this.events.emit("priceUpdate"); //this is just for the ProductTile to update the DOM
    }
    getID() {
        return Utils.hash(this.name);
    }
    static safeCreate(prodObj) {
        let { name } = prodObj;
        if (name && database.hasProductByName(name)) {
            return database.getProduct(name);
        }
        return new Product(prodObj);
    }
    static getByName(name) {
        let h = Utils.hash(name);
        return productsBase[h];
    }
}
export default { Product };