const databaseHelpers = require("../databaseHelpers");
const utils = require("../utils");
const assert = require("assert").strict;

function defineProducts(app) {
    app.get("/api/products/:type", async (req, res) => {
        const type = req.params.type;
        let quantity = req.query.quantity;
        let sort = req.query.sort;
        let desc = req.query.desc;
        try {
            quantity = parseInt(quantity);
            assert.ok(quantity > 0);
        } catch (e) {
            quantity = undefined;
        }
        let products;
        switch(type) {
            case "all":
                products = await databaseHelpers.getAllProducts();
                break;
            case "random":
                if (!quantity) {
                    res.status(400);
                    res.end("Wymagana ilość!");
                    return;
                }
                products = await databaseHelpers.getRandomProducts(quantity);
                break;
            case "recent":
                if (!quantity) {
                    res.status(400);
                    res.end("Wymagana ilość!");
                    return;
                }
                products = await databaseHelpers.getRecentProducts(quantity);
                break;
            case "cheapest":
                if (!quantity) {
                    res.status(400);
                    res.end("Wymagana ilość!");
                    return;
                }
                products = await databaseHelpers.getCheapestProducts(quantity);
                break;
            default:
                res.sendStatus(404);
                return;
        }
        switch(sort) {
            case "date":
                products = products.sortBy(["dateCreated"]);
                if (desc == "true") products = products.reverse();
                res.send(products.value());
                break;
            case "price":
                products = products.sortBy(p => p.prices.PLN);
                if (desc == "true") products = products.reverse();
                res.send(products.value());
                break;
            case "name":
                products = products.sortBy(["name"])
                if (desc == "true") products = products.reverse();
                res.send(products.value());
                break;
            default:
                res.send(products.value());
                return;
        }
    });

    app.get("/api/product/id/:id", async (req, res) => {
        const id = req.params.id;
        if (typeof id === "string") {
            const prodObj = await databaseHelpers.getProduct(id);
            if (prodObj) {
                res.status(200);
                res.send(prodObj);
            } else res.sendStatus(404);
        } else res.sendStatus(400);
    });

    app.get("/api/product/name/:name", async (req, res) => {
        const name = req.params.name;
        if (typeof name === "string") {
            const prodObj = await databaseHelpers.getProductByName(name);
            if (prodObj) {
                res.status(200);
                res.send(prodObj);
            } else res.sendStatus(404);
        } else res.sendStatus(400);
    });
}

module.exports = defineProducts;