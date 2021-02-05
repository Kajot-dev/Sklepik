import { LazyLoad } from "./UI.js";
import localData from "./localData.js";
import router from './router.js';
import {
  navBarTrigger
} from "./UI.js";
import elements from "./elements.js";

document.addEventListener("DOMContentLoaded", () => {
  init();
  router.runCurrentRoute();
  prepareUserData();
});


//basic site functionality
function init() {
  prapareNavigation();
  preventOutline();
  initSearchBar();
  LazyLoad.process(document.body);
  elements.processAll();
}

function preventOutline() {
  document.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    let t = e.target;
    while (t.parentNode) {
      if (!t.hasAttribute("tabindex")) t = t.parentNode;
      else break;
    }
    if (t == document || t == document.body) return;
    let s = t.style.outline;
    t.style.outline = "none";
    t.addEventListener(
      "blur",
      () => {
        t.style.outline = s;
      }, {
        once: true,
      }
    );
  });
}

async function prepareUserData() {
  const loginButton = document.getElementById("loginText");
  const loginLink = document.getElementById("loginLink");
  let nick = await localData.getnick();
  if (nick) {
    loginButton.innerText = nick;
    loginLink.href = "/profil";
  } else loginButton.innerText = "Zaloguj się";
}

function prapareNavigation() {
  //navbar Scroll
  const navBar = document.getElementById("navBar");
  let outAnim;
  let navBarTick = false;
  if (window.scrollY >= navBarTrigger) {
    window.requestAnimationFrame(() => {
      navBar.classList.add("floating");
    });
  }
  document.addEventListener("scroll", _ => {
    if (navBarTick) return;
    const scrollPos = window.scrollY;
    navBarTick = true;
    window.requestAnimationFrame(() => {
      if (scrollPos >= navBarTrigger) {
        if (!navBar.classList.contains("floating") || typeof outAnim === "number") {
          navBar.style.animation = "";
          clearTimeout(outAnim);
          outAnim = null;
          navBar.classList.add("floating");
        }
      } else if (navBar.classList.contains("floating") && typeof outAnim !== "number") {
        navBar.style.animation = "";
        window.requestAnimationFrame(() => {
          outAnim = setTimeout(() => {
            navBar.classList.remove("floating");
            outAnim = null;
          }, 400);
          navBar.style.animation = "navbar-out 0.8s ease";
        });
      }
      navBarTick = false;
    });
  });
  //sidebar trigger
  const sidebarTrigger = document.getElementById("sidebarTrigger");
  const sidebarContainer = document.getElementById("navSidebarContainer");
  sidebarTrigger.addEventListener("click", () => {
    sidebarContainer.classList.toggle("open");
  });
}

function initSearchBar() {
  //stałe
  const placeholders = ["Szukaj...", "Wpisz coś...", "Szukaj produktów..."];
  //elements
  const searchButton = document.querySelectorAll(".searchIcon");
  //searchFunc
  const search = function (searchInp) {
    let value = searchInp.value.trim();
    if (value.length == 0) {
      searchInp.value = searchInp.value.trim();
      let currentPlaceholder = placeholders.indexOf(searchInp.placeholder);
      if (currentPlaceholder >= 0 && currentPlaceholder < placeholders.length - 1) currentPlaceholder++;
      else currentPlaceholder = 0;
      searchInp.placeholder = placeholders[currentPlaceholder];
    } else {
      const wrongChars = /[^\w\s\.,;]/g;
      let match = value.match(wrongChars);
      if (match && match.length > 0) {
        searchInp.value = "";
        match = [...new Set(match)];
        searchInp.placeholder = "Nie używaj: " + match.join(", ");
      } else {
        let destination = new URL("/szukaj", window.location.origin);
        destination.searchParams.set("q", value);
        window.location.assign(destination.toString());
      }
    }
  }
  for (const s of searchButton) {
    const inp = s.nextElementSibling;
    s.addEventListener("click", e => {
      search(inp);
    });
    inp.addEventListener("keydown", e => {
      if (e && e.key.toLowerCase() !== "enter") return;
      search(inp);
    });
  }
}