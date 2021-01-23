
const routes = {
  "szukaj": function () {
    const query = new URLSearchParams(window.location.search);
    let searchquery = query.get("q");
    if (!searchquery) redirectToMain();

  }
};

export function runCurrentRoute() {
  let route = window.location.pathname;
  route = route.replace(/^\/*|\/*$/g, ""); //usuń "/" z początku i końca
  if (typeof routes[route] == "function") routes[route]();
}

export function redirectToMain() {
  window.location.replace(window.location.origin);
}

export function redirect(url) {
  window.location.replace(new URL(url, window.location.origin).href);
}

export function goto(url) {
  if (typeof url == "string") url = new URL(url, window.location.origin)
  window.location.assign(url.href);
}

export default {
  runCurrentRoute,
  redirectToMain,
  redirect,
  goto
};