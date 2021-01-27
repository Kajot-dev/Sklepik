import database from "./database.js";
import {
    ProductTileList
} from "./UI.js";

export function processAll() {
    processProductsSections();
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

export default { processAll, processProductsSections }