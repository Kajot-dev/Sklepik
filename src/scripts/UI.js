import Utils from "./utils.js"
import { Product } from "./internals.js";
const allProducts = []; //tutaj będą wszystkie pordukty, które zaimportujemy z bazy danych



function processSpecialElements() {

}

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
    product;
    constructor(product) {
        super();
        //zapisujemy produkt
        this.product = product;
        //tworzymy wszystkie potrzebne elementy
        this.classList.add("product-tile", "flex-center", "align-center");
        //nazwa produktu
        this.productNameElement.classList.add("product-name");
        if (product.name) this.productNameElement.innerText = product.name;
        this.appendChild(this.productNameElement);
        //zdjęcie produktu
        this.imageContainer.classList.add("image-container");
        this.image.classList.add("product-image");
        this.image.setAttribute("alt", "Zdjęcie produktu");
        if (product.imageLink) this.image.src = product.imageLink;
        this.imageContainer.appendChild(this.image);
        this.appendChild(this.imageContainer);
        //cena - TODO
        this.priceContainer.classList.add("product-price");
        this.addProductInfo(product);
        this.appendChild(this.priceContainer);
    }
    addProductInfo(product) {
        if (product !== this.product) this.product = product;
        
    }
    static possibleColors = []; //tutaj będą wszystkie możliwe kolory
    static lastColor = null;
}


window.customElements.define("product-list", ProductTileList);
window.customElements.define("product-tile", ProductTile);

export default { ProductTile, ProductTileList }