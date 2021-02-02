
import {
  logowanie,
  rejstracja,
  activationStatus,
  profil
} from "./routes/user.js";
import {
  redirectToMain
} from "./routingUtils.js";

const routes = {
  "szukaj": function () {
    const query = new URLSearchParams(window.location.search);
    let searchquery = query.get("q");
    if (!searchquery) redirectToMain();

  },
  "logowanie": logowanie,
  "rejstracja": rejstracja,
  "activation/status": activationStatus,
  "profil": profil
};

export function runCurrentRoute() {
  let route = window.location.pathname;
  route = route.replace(/^\/*|\/*$/g, ""); //usuń "/" z początku i końca
  if (typeof routes[route] == "function") routes[route]();
}

export default {
  runCurrentRoute,
};