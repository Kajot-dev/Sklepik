import Utils from "./utils.js"
import { Product } from "./internals.js";
import localData from "./localData.js";
export const navBarTrigger = 70;
//tutaj będą funkcje np do tworzenia listy produktów
export class ProductTileList extends HTMLElement {
    tagName = "product-list";
    constructor(...products) {
        super();
        this.setAttribute("type", "tile-list");
        for (let product of products) {
            if (product instanceof ProductTile) {
                this.appendChild(product);
            } else if (product instanceof Product) {
                this.appendChild(new ProductTile(product));
            } else {
                let typename = product?.constructor.name || typeof product;
                throw new TypeError(`${products.indexOf(product)}(th) argument is a(n) ${typename}, but should be a Product or ProductTile instance`);
            }
        }
        if (products.length > 1) {
            this.sort();
        }
    }
    sort(w) {
        if (typeof w !== "string") w = ProductTileList.defaultSort;
        let productTiles = this.getTileList();
        productTiles = Utils.unpackEntriesObj(Utils.createPropEntries(["product", w[1]], ...productTiles).sort(Utils.autoSort));
        for (let p of productTiles) {
            this.appendChild(p);
        }
    }
    getTileList() {
        return [...this.children].filter(c => c instanceof ProductTile);
    }
    getProductList() {
        return this.getTileList().map(c => c.product);
    }
    static get defaultSort() {
        return [ProductTileList.defSort, ProductTileList.sorts[ProductTileList.defSort]];
    }
    static get allSorts() {
        return Object.entries(ProductTileList.sorts);
    }
    static defSort = "Data"
    static sorts = {
        "Data": "dateCreated",
        "Nazwa": "name",
        "Marka": "brand"
    }
}

export class ProductTile extends HTMLElement {
    image = document.createElement("img");
    imageContainer = document.createElement("div");
    productNameElement = document.createElement("span");
    priceContainer = document.createElement("div");
    overlay = document.createElement("div");
    buyButton = document.createElement("button");
    product;
    constructor(product, classes) {
        super();
        //sprawdzamy czy to product
        if (!(product instanceof Product)) throw new Error("Product is required!");
        //zapisujemy produkt
        this.product = product;
        //tworzymy wszystkie potrzebne elementy
        this.classList.add("product-tile", "align-center");
        //nazwa produktu
        this.productNameElement.classList.add("product-name");
        this.appendChild(this.productNameElement);
        //zdjęcie produktu
        this.imageContainer.classList.add("image-container");
        this.image.classList.add("product-image");
        this.image.setAttribute("alt", "Zdjęcie produktu");
        this.imageContainer.appendChild(this.image);
        this.appendChild(this.imageContainer);
        //cena
        this.priceContainer.classList.add("product-price");
        //dodatkowe klasy
        if (typeof classes == "string") classes = [classes];
        if (classes instanceof Array) {
            this.classList.add(...classes);
        }
        //elementy do kupna
        this.buyButton.innerText = "KUP";
        this.buyButton.classList.add("buy-button");
        //TODO EVENTY DLA PRZYCISKU
        this.overlay.appendChild(this.buyButton);
        this.overlay.classList.add("tile-overlay", "hidden");
        this.addEventListener("mouseenter", () => {
            this.overlay.classList.remove("hidden");
        });
        this.addEventListener("mouseleave", () => {
            this.overlay.classList.add("hidden");
        });
        this.appendChild(this.overlay);
        //wypełniamy elementy
        this.viewProductInfo(product);
        //zakładamy eventy
        this.product.events.on("priceUpdate", this.viewPrice);
        this.product.events.on("imageUpdate", this.viewImage);
        //dodajemy element do drzewa DOM
        this.appendChild(this.priceContainer);
    }
    viewProductInfo(product) {
        if (!( product instanceof Product ) && this.product instanceof Product) product = this.product;
        else if (product instanceof Product) this.product = product;
        if (product.name) this.viewName(product.name);
        if (product.imageLink) this.viewImage(product.imageLink);
        if (product.prices) this.viewPrice(product.prices);
    }
    viewPrice(pricesObj) {
        const currency = localData.currentCurrency;
        if (currency in pricesObj) this.priceContainer.innerText = pricesObj[currency] + " " + currency;
    }
    viewImage(imageLink) {
        this.image.src = imageLink;
    }
    viewName(name) {
        this.productNameElement.innerText = name
    }
    static possibleColors = []; //tutaj będą wszystkie możliwe kolory
    static lastColor = null;
}


window.customElements.define("product-list", ProductTileList);
window.customElements.define("product-tile", ProductTile);

export default { ProductTile, ProductTileList, navBarTrigger }