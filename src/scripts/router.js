import { ProductTileList } from "./UI.js";
import { Product } from "./internals.js";

const routes = {
  "szukaj.html": function () {
    const query = new URLSearchParams(window.location.search);
    let searchquery = query.get("q");
    if (!searchquery) redirectToMain();

  },
  "produkty": function () {
    let cont = document.getElementById("produkty");
    let buty = new Product({
      name: "Buty sportowe",
      prices: {
        "PLN": "299.99"
      },
      "imageLink": "/images/test.jpg"
    });
    let buty2 = new Product({
      name: "Buty co biegania",
      prices: {
        "PLN": "269.99"
      },
      "imageLink": "/images/test1.jpg"
    });
    cont.appendChild(new ProductTileList(buty, buty2));
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