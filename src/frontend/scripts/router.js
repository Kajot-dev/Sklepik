
const routes = {
  "szukaj": function () {
    const query = new URLSearchParams(window.location.search);
    let searchquery = query.get("q");
    if (!searchquery) redirectToMain();

  },
  "logowanie": function () {
    const loginForm = document.getElementById("login");
    const errorBox = document.getElementById("error");
    const submitBtn = loginForm.querySelector(`button[type="submit"]`);
    loginForm.addEventListener("submit", e => {
      const formD = new FormData(loginForm);
      const formQuery = new URLSearchParams(formD);
      submitBtn.disabled = true;
      fetch("/api/users", {
        method: "POST",
        body: formQuery
      }).then(res => {
        if (!res.ok) {
          res.text().then(t => {
            submitBtn.disabled = false;
            errorBox.style.animation = "";
            window.requestAnimationFrame(() => {
              errorBox.innerText = t;
              errorBox.classList.remove("invisible");
              errorBox.style.animation = "pulse-red 0.5s ease 2";
            });
          });
        } else {
          const windowQuery = new URLSearchParams(window.location.search);
          const cont = windowQuery.get("continue");
          if (cont) goto(cont);
          else goto("/");
        }
      }).catch(() => {
        submitBtn.disabled = false;
      });
      e.preventDefault();
      return false;
    })
  },
  "rejstracja": function () {
    const loginForm = document.getElementById("login");
    const errorBox = document.getElementById("error");
    const submitBtn = loginForm.querySelector(`button[type="submit"]`);
    loginForm.addEventListener("submit", e => {
      const formD = new FormData(loginForm);
      const formQuery = new URLSearchParams(formD);
      submitBtn.disabled = true;
      fetch("/api/users", {
        method: "PUT",
        body: formQuery
      }).then(res => {
        if (!res.ok) {
          res.text().then(t => {
            submitBtn.disabled = false;
            errorBox.style.animation = "";
            window.requestAnimationFrame(() => {
              errorBox.innerText = t;
              errorBox.classList.remove("invisible");
              errorBox.style.animation = "pulse-red 0.5s ease 2";
            });
          });
        } else {
          const windowQuery = new URLSearchParams(window.location.search);
          const cont = windowQuery.get("continue");
          if (cont) goto(cont);
          else goto("/");
        }
      }).catch(() => {
        submitBtn.disabled = false;
      });
      e.preventDefault();
      return false;
    })
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