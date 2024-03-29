import database from "./database.js";
import {
    ProductTileList,
    CartView,
    FavView
} from "./UI.js";

export function processAll() {
    processProductsSections();
    processSectionLayouts();
    processCartSections();
    processFavSections();
}

export function processProductsSections(context = document) {
    let sections = context.querySelectorAll(`section[type="product-tile-list"]`);
    for (let section of sections) {
        let opts = {};
        let nowUrl = new URL(window.location.origin);
        let listopts = {};
        let products = []
        if (section.hasAttribute("quantity")) {
            let quantity = parseInt(section.getAttribute("quantity"));
            nowUrl.searchParams.set("quantity", quantity);
            const which = section.getAttribute("which")
            if (["recent", "random", "cheapest"].includes(which)) {
                nowUrl.pathname = "/api/products/" + which;
            } else break;
        } else {
            nowUrl.pathname = "/api/products/all"
        }
        const sort = section.getAttribute("sort");
        let desc = section.hasAttribute("rev")
        nowUrl.searchParams.set("desc", desc.toString());
        if (["date", "price", "name"].includes(sort)) nowUrl.searchParams.set("sort", sort);
        if (sort) listopts.sorted = [sort, desc];
        fetch(nowUrl.href).then(res => {
            if (res.ok) {
                res.json().then(data => {
                    products = database.processProdObjs(data);
                    if (section.hasAttribute("no-overlay")) opts.noOverlay = true;
                    let list = new ProductTileList(products, opts, listopts);
                    section.appendChild(list)
                })
            }
        });
    }
}

export function processSectionLayouts(context = document) {
    const sections = context.querySelectorAll(`section[type="selection-layout"]`);

    for (const sec of sections) {
        const selColum = sec.querySelector(".selection-column");
        const dataColumn = sec.querySelector(".data-column");
        if (!selColum || !dataColumn) break;
        const selectables = [...selColum.querySelectorAll(".selection-option")];
        const dataFields = dataColumn.querySelectorAll(".selection-data");
        for (const opt of selectables) {
            opt.addEventListener("click", e => {
                if (opt.hasAttribute("selected")) return;
                const sel = selectables.find(s => s.hasAttribute("selected"));
                if (sel) sel.removeAttribute("selected");
                const target = opt.getAttribute("data-option");
                for (const field of dataFields) {
                    if (field.getAttribute("data-content") === target) {
                        field.classList.remove("hidden");
                    } else field.classList.add("hidden");
                }
                opt.setAttribute("selected", "");
            });
        }
        let selected;
        let selQuery = new URLSearchParams(window.location.search).get("sel");
        if (typeof selQuery === "string") {
            selQuery = selQuery.trim();
            selected = selectables.find(s => {
                return s.getAttribute("data-option") === selQuery
            });
        }
        selected = selected ? selected : selectables.find(s => s.hasAttribute("selected"));
        selected = selected ? selected : selectables[0];
        selected.removeAttribute("selected");
        selected.click();
   }
}

export function processCartSections(context = document) {
    const allCarts = context.querySelectorAll(`section[type="cart"]`);
    for (const cartCont of allCarts) {
        cartCont.appendChild(new CartView());
    }
}

export function processFavSections(context = document) {
    const allFavs = context.querySelectorAll(`section[type="favourites"]`);
    for (const favCont of allFavs) {
        favCont.appendChild(new FavView());
    }
}

export default { processAll, processProductsSections, processSectionLayouts, processCartSections }