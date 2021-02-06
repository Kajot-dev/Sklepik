import Utils from "./utils.js";
import localData from "./localData.js";
import database from "./database.js";
const { EventEmitter } = Utils;
import { PopUp } from "./UI.js";

export class Product {
    name;
    prices;
    dateCreated;
    imageLink;
    isFav = false;
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
        localData.isInFavourites(this.ID).then(status => {
            if (status) {
                this.isFav = true;
                this.events.emit("favUpdated", status);
            }
        });
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
    addToCart(quantity = 1) {
        localData.addToCart(this, quantity);
    }
    addToFavourites() {
        localData.addToFavourites(this.ID).then(() => {
            PopUp.create("Dodano do uubionych!", {
                timeout: 2000
            });
            this.isFav = true;
            this.events.emit("favUpdated", true);
        })
    }
    removeFromFavourites() {
        localData.removeFromFavourites(this.ID).then(() => {
            PopUp.create("Usunięto z ulubionych!", {
                timeout: 2000
            });
            this.isFav = false;
            this.events.emit("favUpdated", false);
        });
    }
    static safeCreate(prodObj) {
        let { name } = prodObj;
        let prod = database.getProduct(name);
        if (prod) return prod;
        return new Product(prodObj);
    }
}
export default { Product };