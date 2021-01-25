import Utils from "./utils.js"
import {
    Product
} from "./internals.js";
import localData from "./localData.js";
import {
    fieldGenerator
} from "./utils.js";
import router from "./router.js";




export const navBarTrigger = 70;
//tutaj będą funkcje np do tworzenia listy produktów
export class ProductTileList extends HTMLElement {
    tagName = "product-list";
    allElems = [];
    constructor(products, options, listopts = {}) {
        super();
        this.setAttribute("type", "tile-list");
        for (let product of products) {
            if (product instanceof ProductTile) {
                this.allElems.push(product);
            } else if (product instanceof Product) {
                this.allElems.push(new ProductTile(product, options))
            } else {
                let typename = product ? this.constructor.name : typeof product;
                throw new TypeError(`${products.indexOf(product)}(th) argument is a(n) ${typename}, but should be a Product or ProductTile instance`);
            }
        }
        if (listopts.sorted) this.curSort = listopts.sorted;
        if (products.length > 1 && !listopts.sorted) {
            this.sort();
        } else {
            this.retype(this.getFiltered());
            this.reshow();
        }

    }
    sort(w, desc = false) {
        if (typeof w == "undefined") w = ProductTileList.defSort;
        if (!(w in ProductTileList.valuables)) throw new Error("Invalid sort!");
        this.curSort = [w, desc];
        w = ProductTileList.valuables[w];
        if (typeof w == "string") w = [w];
        let productTiles = this.getAllTiles();
        productTiles = Utils.sortByProps(Utils.autoSort, ["product", ...w], ...productTiles);
        if (desc) productTiles = productTiles.reverse();
        this.retype(productTiles);
        this.allElems = productTiles;
        this.reshow();
    }
    getAllTiles() {
        return new Array(...this.allElems);
    }
    showAllElems() {
        this.clearFilters();
        this.showSomeTiles(this.allElems);
    }
    reshow() {
        const filtered = this.getFiltered(this.getAllTiles());
        this.showSomeTiles(filtered);
    }
    showSomeTiles(tiles) {
        for (const c of this.children) {
            c.remove();
        }
        this.append(...tiles);
    }
    clearFilters() {
        //TODO
    }
    getFiltered(products) {
        //TODO
        return products;
    }
    applyFilter() {
        //this will apply filter to children
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
        return Object.entries(ProductTileList.valuables);
    }
    static isSortAvailable(name) {
        return ProductTileList.valuables.hasOwnProperty(name);
    }
    static defSort = "date"
    static valuables = {
        "date": "dateCreated",
        "name": "name",
        "price": ["prices", localData.currentCurrency()]
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
    dateContainer = document.createElement("div");
    breakLine = document.createElement("hr");
    product;
    constructor(product, options) {
        options = options || {};
        super();
        this.setAttribute("title", "Zobacz produkt!");
        //sprawdzamy czy to product
        if (!(product instanceof Product)) throw new Error("Product is required!");
        //zapisujemy produkt
        this.product = product;
        //tworzymy wszystkie potrzebne elementy
        this.classList.add("product-tile", "align-center");
        //nazwa produktu
        this.productNameElement.classList.add("product-name");
        this.appendChild(this.productNameElement);
        //linia
        this.breakLine.classList.add("break-line");
        this.appendChild(this.breakLine);
        //cena
        this.priceContainer.classList.add("product-price");
        this.appendChild(this.priceContainer);
        //zdjęcie produktu
        this.imageContainer.classList.add("image-container");
        this.image.classList.add("product-image");
        this.image.setAttribute("alt", "Zdjęcie produktu");
        this.imageContainer.appendChild(this.image);
        this.appendChild(this.imageContainer);
        //data
        this.dateContainer.classList.add("date-container");
        this.append(this.dateContainer);
        //Cały overlay
        if (options.noOverlay !== true) {
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
        }
        this.appendChild(this.overlay);
        //wypełniamy elementy
        this.viewProductInfo(product);
        //zakładamy eventy
        this.product.events.on("priceUpdate", this.viewPrice);
        this.product.events.on("imageUpdate", this.viewImage);
        this.addEventListener("click", () => {
            let dest = new URL("/produkty/pokaż.html", window.location.origin);
            dest.searchParams.set("p", this.product.getID());
            router.goto(dest);
        });
        //dodajemy element do drzewa DOM

    }
    viewProductInfo(product) {
        if (!(product instanceof Product) && this.product instanceof Product) product = this.product;
        else if (product instanceof Product) this.product = product;
        if (product.name) this.viewName(product.name);
        if (product.dateCreated) this.viewDateCreated(product.dateCreated)
        if (product.imageLink) this.viewImage(product.imageLink);
        if (product.prices) this.viewPrice(product.prices);
    }
    viewPrice(pricesObj) {
        const currency = localData.currentCurrency();
        console.log(currency, currency in pricesObj, pricesObj);
        if (currency in pricesObj) this.priceContainer.innerText = pricesObj[currency] + " " + currency;
    }
    viewImage(imageLink) {
        this.image.src = imageLink;
        LazyLoad.processSingle(this.image);
    }
    viewName(name) {
        this.productNameElement.innerText = name
    }
    viewDateCreated(date) {
        const formatter = new Intl.DateTimeFormat("pl-PL", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        let formatted = formatter.format(date);
        this.dateContainer.innerText = "(" + formatted + ")";
    }
    changeType(type) {
        if (this.type) this.classList.remove(this.type);
        this.classList.add(type);
        this.type = type;
    }
    static lastColor = null;
}

export class LazyLoad {
    static processSingle(img) {
        if (img.complete || img.hasAttribute("lazy-load-ignore")) return;
        img.style.opacity = 0;
        img.addEventListener(
            "load",
            e => {
                img.style.animation = "appear 0.4s ease";
                img.style.opacity = "";
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        img.style.animation = "";
                    });
                }, 400);
            }, {
                once: true,
            }
        );
        img.addEventListener(
            "error",
            e => {
                img.style.opacity = "";
            }, {
                once: true,
            }
        );
    }
    static process(elem) {
        let nodes = elem.querySelectorAll("img");
        for (let img of nodes) {
            LazyLoad.processSingle(img);
        }
    }
}

window.customElements.define("product-list", ProductTileList);
window.customElements.define("product-tile", ProductTile);

export default {
    ProductTile,
    ProductTileList,
    LazyLoad,
    navBarTrigger
}