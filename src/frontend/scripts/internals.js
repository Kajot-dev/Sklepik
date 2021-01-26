import Utils from "./utils.js";
import database from "./database.js";
const { EventEmitter } = Utils;

export class Product {
    name;
    prices;
    dateCreated;
    imageLink;
    events = new EventEmitter();
    constructor({ name, prices, imageLink, dateCreated, ID}) {
        if (!name) throw new Error("Name is required!");
        //we don't fire events in constructor
        this.name = name;
        this.prices = prices;
        this.imageLink = imageLink;
        this.dateCreated = dateCreated;
        this.ID = ID;
        database.registerProduct(this);
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
        let prod = database.getProduct(name);
        if (prod) return prod;
        return new Product(prodObj);
    }
}
export default { Product };