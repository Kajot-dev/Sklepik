import Utils from "./utils.js";
const { EventEmitter } = Utils;
import localData from "./localData.js";
const productsBase = {};


export class Product {
    name;
    prices;
    dateCreated;
    imageLink;
    events = new EventEmitter();
    constructor({ name, prices, imageLink, dateCreated }) {
        //we don't fire events in constructor
        this.name = name;
        if (name) {
            let h = Utils.hash(name);
            if (h in productsBase) throw new Error("This Product has already been declared! Use Product.getByName() instead!");
            productsBase[h] = this;
        }
        this.prices = prices;
        this.imageLink = imageLink;
        if (dateCreated instanceof String) this.dateCreated = new Date(dateCreated);
        else if (dateCreated instanceof Date) this.dateCreated = dateCreated;
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
        else if (date instanceof String) this.dateCreated = new Date(date);
        else throw new Error("This object is nor a String or a Date!");
    }
    updateCurrency() {
        this.events.emit("priceUpdate"); //this is just for the ProductTile to update the DOM
    }
    getCurrency() {
        return localData.currentCurrency;
    }
    static safeCreate(prodObj) {
        let { name } = prodObj;
        if (name) {
            let h = Utils.hash(name);
            if (h in productsBase) return productsBase[h];
        }
        return new Product(prodObj);
    }
    static getByName(name) {
        let h = Utils.hash(name);
        return productsBase[h];
    }
}
export default { Product };