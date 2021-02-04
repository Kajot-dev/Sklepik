
import {
  logowanie,
  rejstracja,
  activationStatus,
  profil
} from "./routes/user.js";
import {
  redirectToMain
} from "./routingUtils.js";
import { ProdShow } from "./UI.js";
import { Product } from "./internals.js";

const routes = {
  "szukaj": function () {
    const query = new URLSearchParams(window.location.search);
    let searchquery = query.get("q");
    if (!searchquery) redirectToMain();

  },
  "logowanie": logowanie,
  "rejstracja": rejstracja,
  "activation/status": activationStatus,
  "profil": profil,
  "produkty/pokaż": function() {
    const prodCotainer = document.getElementById("prod-show-container");
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("p")) {
      const prodID = queryParams.get("p").trim();
      fetch("/api/product/id/" + prodID).then(res => {
        if (res.ok) {
          res.json().then(prodData => {
            const prod = Product.safeCreate(prodData);
            prodCotainer.appendChild(new ProdShow(prod));
          });
        } else redirectToMain();
      }).catch(err => {

      });
    } else redirectToMain();
  }
};

export function runCurrentRoute() {
  let route = decodeURI(window.location.pathname);
  route = route.replace(/^\/*|\/*$/g, ""); //usuń "/" z początku i końca
  route = route.endsWith(".html") ? route.slice(0, route.length - 5) : route;
  if (typeof routes[route] == "function") routes[route]();
}

export default {
  runCurrentRoute,
};