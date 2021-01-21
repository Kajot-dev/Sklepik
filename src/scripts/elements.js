import database from "./database.js";
import {
    ProductTileList
} from "./UI.js";

export function processAll() {
    processProductsSections();
}

export async function processProductsSections() {
    await database.isReady();
    let sections = document.querySelectorAll(`section[type="product-tile-list"]`);
    for (let section of sections) {
        let opts = {};
        let products;
        if (section.hasAttribute("quantity")) {
            let quantity = parseInt(section.getAttribute("quantity"));
            switch (section.getAttribute("which")) {
                case "recent":
                    products = database.getRecentProducts(quantity);
                    break;
                case "random":
                    products = database.getRandomProducts(quantity);
                    break;
                default:
                    products = database.getRandomProducts(quantity);
                    break;
            }
        } else {
            products = database.getAllProducts();
        }
        if (section.hasAttribute("no-overlay")) opts.noOverlay = true;
        let list = new ProductTileList(products, opts);
        if (section.hasAttribute("order") && ProductTileList.isSortAvailable(section.getAttribute("order"))) {
            list.sort(section.getAttribute("order"), section.hasAttribute("rev"));
        }
        section.appendChild(list);
    }
}

export default { processAll, processProductsSections }