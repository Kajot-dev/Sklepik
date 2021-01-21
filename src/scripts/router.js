import { ProductTileList, ProductTile } from "./UI.js";
import database from "./database.js";
const routes = {
  "szukaj.html": function () {
    const query = new URLSearchParams(window.location.search);
    let searchquery = query.get("q");
    if (!searchquery) redirectToMain();

  },
  "produkty": async function () {
    let cont = document.getElementById("produkty");
    await database.isReady();
    let products = database.getAllProducts();
    products = products.map(p => new ProductTile(p));
    cont.appendChild(new ProductTileList(...products));
  }
};

function runCurrentRoute() {
  let route = window.location.pathname;
  route = route.replace(/^\/*|\/*$/g, ""); //usuń "/" z początku i końca
  if (typeof routes[route] == "function") routes[route]();
}

function redirectToMain() {
  window.location.replace(window.location.origin);
}

export default {
  runCurrentRoute,
  redirectToMain
};