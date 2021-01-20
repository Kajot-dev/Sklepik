import Utils from "./utils.js"
import { Product } from "./internals.js";
import localData from "./localData.js";
import { fieldGenerator } from "./utils.js";




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
        } else this.retype();
    }
    sort(w, desc = false) {
        if (typeof w == "undefined") w = ProductTileList.defSort;
        if (!(w in ProductTileList.sorts)) throw new Error("Invalid sort!");
        this.curSort = [w, desc];
        w = ProductTileList.sorts[w];
        if (typeof w == "string") w = [w]; 
        let productTiles = this.getTileList();
        let sorted = Utils.createPropEntries(["product", ...w], ...productTiles).sort(Utils.autoSort);
        productTiles = Utils.unpackEntriesObj(sorted);
        if (desc) productTiles = productTiles.reverse();
        this.retype(productTiles);
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
    retype(newOrder) {
        newOrder = newOrder instanceof Array ? newOrder : this.getTileList();
        const colorGenerator = fieldGenerator(...ProductTileList.defColors);
        for (let pT of newOrder) {
            pT.changeType(colorGenerator.next().value);
        }
    }
    curSort;
    get currentSort() {
        if (this.curSort instanceof Array) return this.curSort;
        return [ProductTileList.defSort, false];
    }
    static get allSorts() {
        return Object.entries(ProductTileList.sorts);
    }
    static defSort = "Data"
    static sorts = {
        "Data": "dateCreated",
        "Nazwa": "name",
        "Marka": "brand",
        "Cena": ["prices", localData.currentCurrency]
    }
    static defColors = ["type-A", "type-B", "type-C", "type-D", "type-E"];
}

export class ProductTile extends HTMLElement {
    image = document.createElement("img");
    imageContainer = document.createElement("div");
    productNameElement = document.createElement("span");
    priceContainer = document.createElement("div");
    overlay = document.createElement("div");
    buyButton = document.createElement("button");
    addToCartButton = document.createElement("button");
    product;
    constructor(product) {
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
        //elementy do kupna
        this.buyButton.innerText = "Kup teraz";
        this.buyButton.classList.add("buy-button");
        //dodaj do koszyka
        this.addToCartButton.innerText = "Dodaj do koszyka";
        this.addToCartButton.classList.add("add-to-cart-button");
        //TODO EVENTY DLA PRZYCISKU
        this.overlay.appendChild(this.buyButton);
        this.overlay.appendChild(this.addToCartButton);
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
    changeType(type) {
        if (this.type) this.classList.remove(this.type);
        this.classList.add(type);
        this.type = type;
    }
    static lastColor = null;
}


window.customElements.define("product-list", ProductTileList);
window.customElements.define("product-tile", ProductTile);

export default { ProductTile, ProductTileList, navBarTrigger }