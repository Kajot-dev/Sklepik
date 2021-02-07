import Utils from "./utils.js"
import {
    Product
} from "./internals.js";
import localData from "./localData.js";
import {
    fieldGenerator
} from "./utils.js";
import routingUtils from "./routingUtils.js";




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
        return this.allElems;
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
    favButton = document.createElement("button");
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
            this.buyButton.addEventListener("click", e => {
                e.stopPropagation();
                this.product.addToCart();
                routingUtils.goto("koszyk");
            }, {
                once: true
            });
            //dodajemy
            if (this.product.isFav) {
                this.favButton.innerHTML = "&#9829;"
            } else {
                this.favButton.innerHTML = "&#9825;"
            }
            this.product.events.on("favUpdated", status => {
                if (status) this.favButton.innerHTML = "&#9829;"
                else this.favButton.innerHTML = "&#9825;"
            });
            this.favButton.classList.add("fav-button");
            this.favButton.addEventListener("click", async e => {
                e.stopPropagation();
                if (await localData.isLoggedIn()) {
                    if (this.product.isFav) this.product.removeFromFavourites();
                    else this.product.addToFavourites();
                } else routingUtils.goto("/logowanie");
            });
            //dodaj do koszyka
            this.addToCartButton.innerText = "Dodaj do koszyka";
            this.addToCartButton.classList.add("add-to-cart-button");
            this.addToCartButton.addEventListener("click", e => {
                e.stopPropagation();
                this.product.addToCart();
                PopUp.create("Dodano do koszyka!", {
                    timeout: 2000
                });
            });
            this.overlay.setAttribute("if-normal", "");
            this.overlay.setAttribute("if-tablet", "");
            this.overlay.appendChild(this.buyButton);
            this.overlay.appendChild(this.favButton);
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
            routingUtils.goto(dest);
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

export class ProdShow extends HTMLElement {
    image = document.createElement("img");
    imageContainer = document.createElement("div");
    productNameElement = document.createElement("span");
    priceContainer = document.createElement("div");
    priceElem = document.createElement("div");
    buyButton = document.createElement("button");
    favButton = document.createElement("button");
    addToCartButton = document.createElement("button");
    dateContainer = document.createElement("div");
    breakLine1 = document.createElement("hr");
    breakLine2 = document.createElement("hr");
    col1 = document.createElement("div");
    col2 = document.createElement("div");
    btnContainer = document.createElement("div");
    product;
    constructor(product) {
        super();
        //sprawdzamy czy to product
        if (!(product instanceof Product)) throw new Error("Product is required!");
        //zapisujemy produkt
        this.product = product;
        //tworzymy wszystkie potrzebne elementy
        this.classList.add("flex-row", "flex-center", "align-center", "convertable");
        //kolumna 1
        this.col1.classList.add("half-col");
        //zdjęcie produktu
        this.imageContainer.classList.add("image-container");
        this.image.classList.add("product-image");
        this.image.setAttribute("alt", "Zdjęcie produktu");
        this.imageContainer.appendChild(this.image);
        this.col1.appendChild(this.imageContainer);
        //kolumna2
        this.col2.classList.add("half-col");
        //nazwa produktu
        this.productNameElement.classList.add("product-name");
        this.col2.appendChild(this.productNameElement);
        //linia1
        this.breakLine1.classList.add("break-line");
        this.col2.appendChild(this.breakLine1);
        //cena
        this.priceElem.classList.add("product-price");
        this.priceContainer.classList.add("price-container")
        this.priceContainer.appendChild(this.priceElem);
        this.col2.appendChild(this.priceContainer);
        //przyciski
        this.btnContainer.classList.add("btnContainer");
        this.buyButton.innerText = "Kup teraz";
        this.buyButton.setAttribute("data-role", "buy");
        this.favButton.classList.add("fav-button");
        if (this.product.isFav) {
            this.favButton.innerHTML = "&#9829;"
        } else {
            this.favButton.innerHTML = "&#9825;"
        }
        this.addToCartButton.innerText = "Dodaj do koszyka";
        this.addToCartButton.setAttribute("data-role", "addToCart");
        this.btnContainer.appendChild(this.addToCartButton);
        this.btnContainer.appendChild(this.favButton);
        this.btnContainer.appendChild(this.buyButton)
        this.col2.appendChild(this.btnContainer);
        //linia2
        this.breakLine2.classList.add("break-line");
        this.col2.appendChild(this.breakLine2);
        //data
        this.dateContainer.classList.add("date-container");
        this.col2.append(this.dateContainer);
        //wypełniamy elementy
        this.viewProductInfo(product);
        //zakładamy eventy
        this.product.events.on("priceUpdate", this.viewPrice);
        this.product.events.on("imageUpdate", this.viewImage);
        this.buyButton.addEventListener(e => {
            e.stopPropagation();
            this.product.addToCart();
            routingUtils.goto("koszyk");
        }, {
            once: true
        });
        this.favButton.addEventListener("click", async e => {
            e.stopPropagation();
            if (await localData.isLoggedIn()) {
                if (this.product.isFav) this.product.removeFromFavourites();
                else this.product.addToFavourites();
            } else routingUtils.goto("/logowanie");
        });
        this.product.events.on("favUpdated", status => {
            if (status) this.favButton.innerHTML = "&#9829;"
            else this.favButton.innerHTML = "&#9825;"
        });
        this.addToCartButton.addEventListener("click", e => {
            e.stopPropagation();
            this.product.addToCart();
            PopUp.create("Dodano do koszyka!", {
                timeout: 2000
            });
        });
        //dodajemy element do drzewa DOM
        this.append(this.col1, this.col2);

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
        if (currency in pricesObj) this.priceElem.innerText = pricesObj[currency] + " " + currency;
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
        this.dateContainer.innerText = formatted;
    }
}
export class CartView extends HTMLElement {
    constructor() {
        super();
        this.classList.add("flex-column", "flex-start", "align-center");
        const cart = localData.getCart()
        const prods = Object.keys(cart);
        if (prods.length == 0) {
            this.classList.add("padding");
            this.innerText = "Koszyk jest pusty";
            return;
        }
        fetch("/api/products/some", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                IDs: prods
            })
        }).then(res => {
            if (res.ok) {
                res.json().then(prodObjs => {
                    for (const p of prodObjs) {
                        this.appendChild(new CartElement(Product.safeCreate(p), cart[p.ID].quantity));
                    }
                });
            } else {
                console.warn(res);
            }
        }).catch(err => {
            console.error(err);
        })
    }
    checkEx() {
        if (this.children.length == 0) {
            this.innerText = "Koszyk jest pusty";
            this.classList.add("padding");
        }
    }
}

export class CartElement extends HTMLElement {
    image = document.createElement("img");
    imageContainer = document.createElement("div");
    productNameElement = document.createElement("span");
    priceContainer = document.createElement("div");
    priceElem = document.createElement("div");
    quanElem = document.createElement("input");
    col1 = document.createElement("div");
    col2 = document.createElement("div");
    col3 = document.createElement("div");
    remBtn = document.createElement("button")
    product;
    constructor(product, quantity = 1) {
        super();
        //sprawdzamy czy to product
        if (!(product instanceof Product)) throw new Error("Product is required!");
        //ilość
        this.quantity = quantity;
        //zapisujemy produkt
        this.product = product;
        //tworzymy wszystkie potrzebne elementy
        this.classList.add("flex-row", "flex-center", "align-center");
        //kolumna 1
        this.col1.classList.add("col-1", "flex-center", "align-center", "flex-column");
        //zdjęcie produktu
        this.imageContainer.classList.add("image-container");
        this.image.classList.add("product-image");
        this.image.setAttribute("alt", "Zdjęcie produktu");
        this.imageContainer.appendChild(this.image);
        this.col1.appendChild(this.imageContainer);
        //kolumna 2
        this.col2.classList.add("col-2", "flex-row", "align-center", "flex-between", "side-padding");
        //nazwa produktu
        this.productNameElement.classList.add("product-name");
        this.col2.appendChild(this.productNameElement);
        //cena
        this.priceElem.classList.add("product-price");
        this.priceContainer.classList.add("price-container")
        this.priceContainer.appendChild(this.priceElem);
        this.col2.appendChild(this.priceContainer);
        //kolumna 3
        this.col3.classList.add("col-3", "flex-row", "align-center", "flex-around");
        //ilość
        this.quanElem.setAttribute("type", "number");
        this.quanElem.setAttribute("min", 1);
        this.quanElem.setAttribute("step", 1);
        this.quanElem.value = this.quantity;
        this.col3.appendChild(this.quanElem);
        //przycisk do usuwania
        this.remBtn.innerText = "Usuń";
        this.col3.appendChild(this.remBtn);
        //wypełniamy elementy
        this.viewProductInfo(product);
        //zakładamy eventy
        this.product.events.on("priceUpdate", this.viewPrice);
        this.product.events.on("imageUpdate", this.viewImage);
        this.imageContainer.addEventListener("click", () => {
            let dest = new URL("/produkty/pokaż.html", window.location.origin);
            dest.searchParams.set("p", this.product.getID());
            routingUtils.goto(dest);
        });
        this.productNameElement.addEventListener("click", () => {
            let dest = new URL("/produkty/pokaż.html", window.location.origin);
            dest.searchParams.set("p", this.product.getID());
            routingUtils.goto(dest);
        });
        //zmiana ilości
        this.quanElem.addEventListener("change", e => {
            this.quantity = this.quanElem.value;
            localData.setCartProduct(this.product, this.quantity);
            this.viewPrice(this.product.prices);
        });
        //usuwanie z koszyka
        this.remBtn.addEventListener("click", e => {
            e.stopPropagation();
            localData.removeFromCart(this.product);
            const p = this.parentNode;
            this.remove();
            p.checkEx();
        }, {
            once: true
        });
        //dodajemy elementy do drzewa DOM
        this.append(this.col1, this.col2, this.col3);

    }
    viewProductInfo(product) {
        if (!(product instanceof Product) && this.product instanceof Product) product = this.product;
        else if (product instanceof Product) this.product = product;
        if (product.name) this.viewName(product.name);
        if (product.imageLink) this.viewImage(product.imageLink);
        if (product.prices) this.viewPrice(product.prices);
    }
    viewPrice(pricesObj) {
        const currency = localData.currentCurrency();
        if (currency in pricesObj) this.priceElem.innerText = pricesObj[currency] * this.quantity + " " + currency;
    }
    viewImage(imageLink) {
        this.image.src = imageLink;
        LazyLoad.processSingle(this.image);
    }
    viewName(name) {
        this.productNameElement.innerText = name
    }
}


export class FavView extends HTMLElement {
    constructor() {
        super();
        this.classList.add("flex-column", "flex-start", "align-center");
        localData.getFavourites().then(favs => {
            if (favs.length == 0) {
                this.classList.add("padding");
                this.innerText = "Nie masz ulubionych produktów";
                return;
            }
            fetch("/api/products/some", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    IDs: favs
                })
            }).then(res => {
                if (res.ok) {
                    res.json().then(prodObjs => {
                        for (const p of prodObjs) {
                            this.appendChild(new FavElement(Product.safeCreate(p)));
                        }
                    });
                } else {
                    console.warn(res);
                }
            }).catch(err => {
                console.error(err);
            });
        });
    }
    checkEx() {
        if (this.children.length == 0) {
            this.innerText = "Nie masz ulubionych produktów";
            this.classList.add("padding");
        }
    }
}

export class FavElement extends HTMLElement {
    image = document.createElement("img");
    imageContainer = document.createElement("div");
    productNameElement = document.createElement("span");
    priceContainer = document.createElement("div");
    priceElem = document.createElement("div");
    col1 = document.createElement("div");
    col2 = document.createElement("div");
    col3 = document.createElement("div");
    remBtn = document.createElement("button")
    product;
    constructor(product) {
        super();
        //sprawdzamy czy to product
        if (!(product instanceof Product)) throw new Error("Product is required!");
        //zapisujemy produkt
        this.product = product;
        //tworzymy wszystkie potrzebne elementy
        this.classList.add("flex-row", "flex-center", "align-center");
        //kolumna 1
        this.col1.classList.add("col-1", "flex-center", "align-center", "flex-column");
        //zdjęcie produktu
        this.imageContainer.classList.add("image-container");
        this.image.classList.add("product-image");
        this.image.setAttribute("alt", "Zdjęcie produktu");
        this.imageContainer.appendChild(this.image);
        this.col1.appendChild(this.imageContainer);
        //kolumna 2
        this.col2.classList.add("col-2", "flex-row", "align-center", "flex-between", "side-padding");
        //nazwa produktu
        this.productNameElement.classList.add("product-name");
        this.col2.appendChild(this.productNameElement);
        //cena
        this.priceElem.classList.add("product-price");
        this.priceContainer.classList.add("price-container")
        this.priceContainer.appendChild(this.priceElem);
        this.col2.appendChild(this.priceContainer);
        //kolumna 3
        this.col3.classList.add("col-3", "flex-row", "align-center", "flex-around");
        //przycisk do usuwania
        this.remBtn.innerText = "Usuń";
        this.col3.appendChild(this.remBtn);
        //wypełniamy elementy
        this.viewProductInfo(product);
        //zakładamy eventy
        this.product.events.on("priceUpdate", this.viewPrice);
        this.product.events.on("imageUpdate", this.viewImage);
        this.imageContainer.addEventListener("click", () => {
            let dest = new URL("/produkty/pokaż.html", window.location.origin);
            dest.searchParams.set("p", this.product.getID());
            routingUtils.goto(dest);
        });
        this.productNameElement.addEventListener("click", () => {
            let dest = new URL("/produkty/pokaż.html", window.location.origin);
            dest.searchParams.set("p", this.product.getID());
            routingUtils.goto(dest);
        });
        //usuwanie z ulubionych
        this.remBtn.addEventListener("click", e => {
            e.stopPropagation();
            localData.removeFromFavourites(this.product).then(() => {
                PopUp.create("Usunięto z ulubionych!", {
                    timeout: 2000
                });
            });
            const p = this.parentNode;
            this.remove();
            p.checkEx();
        }, {
            once: true
        });
        //dodajemy elementy do drzewa DOM
        this.append(this.col1, this.col2, this.col3);
    }
    viewProductInfo(product) {
        if (!(product instanceof Product) && this.product instanceof Product) product = this.product;
        else if (product instanceof Product) this.product = product;
        if (product.name) this.viewName(product.name);
        if (product.imageLink) this.viewImage(product.imageLink);
        if (product.prices) this.viewPrice(product.prices);
    }
    viewPrice(pricesObj) {
        const currency = localData.currentCurrency();
        if (currency in pricesObj) this.priceElem.innerText = pricesObj[currency] + " " + currency;
    }
    viewImage(imageLink) {
        this.image.src = imageLink;
        LazyLoad.processSingle(this.image);
    }
    viewName(name) {
        this.productNameElement.innerText = name
    }
}


export class PopUp extends HTMLElement {
    dialog = document.createElement("div");
    textCont = document.createElement("div");
    btnCont = document.createElement("div");
    constructor(text, options = {}) {
        super();
        this.classList.add("flex-column", "flex-right", "align-center");
        this.dialog.classList.add("dialog");
        this.textCont.classList.add("text");
        this.textCont.innerText = text;
        this.dialog.appendChild(this.textCont);
        if (options.buttons) {
            this.btnCont.classList.add("btnContainer");
            for (const [key, func] of Object.entries(options.buttons)) {
                let btn = document.createElement("button");
                btn.innerText = key;
                btn.addEventListener("click", e => {
                    e.stopPropagation();
                    func();
                    this.unShow();
                });
                this.btnCont.appendChild(btn);
            }
            this.dialog.appendChild(this.btnCont);
        }
        this.appendChild(this.dialog);
        const showTime = typeof options.timeout === "number" ? options.timeout : 5000;
        if (PopUp.activePopUp) {
            this.style.display = "none";
            PopUp.activePopUp.unShow().then(() => {
                this.style.display = "";
                if (!options.buttons) this.timeoutNum = setTimeout(() => {
                    this.timeoutNum = null;
                    this.unShow();
                }, showTime);
                PopUp.activePopUp = this;
            });
        } else {
            if (!options.buttons) this.timeoutNum = setTimeout(() => {
                this.timeoutNum = null;
                this.unShow();
            }, showTime);
            PopUp.activePopUp = this;
        }
        this.dialog.style.animation = "dialog-in 0.4s ease";
        this.style.animation = "popup-in 0.4s ease";
        setTimeout(() => {
            this.dialog.style.animation = "";
            this.style.animation = "";
        }, 400);
    }
    async unShow() {
        if (PopUp.activePopUp === this) PopUp.activePopUp = null;
        if (this.timeoutNum) clearTimeout(this.timeoutNum);
        window.requestAnimationFrame(() => {
            this.dialog.style.animation = "dialog-in 0.4s ease reverse forwards";
            this.style.animation = "popup-in 0.4s ease reverse forwards";
            setTimeout(() => {
                this.remove();
            }, 400);
        });
    }
    static activePopUp;
    static create(text, options) {
        const p = new PopUp(text, options);
        document.body.appendChild(p);
    }
}



window.customElements.define("product-list", ProductTileList);
window.customElements.define("product-tile", ProductTile);
window.customElements.define("product-show", ProdShow);
window.customElements.define("cart-view", CartView);
window.customElements.define("cart-element", CartElement);
window.customElements.define("fav-view", FavView);
window.customElements.define("fav-element", FavElement);
window.customElements.define("pop-up", PopUp);

export default {
    ProductTile,
    ProductTileList,
    LazyLoad,
    ProdShow,
    CartView,
    CartElement,
    FavView,
    FavElement,
    PopUp,
    navBarTrigger
}