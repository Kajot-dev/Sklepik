const NavBarTrigger = 60;

//enables all basic UI elements
function init() {
    prapareNavigation();
    preventOutline();
    initSearchBar();
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

function prapareNavigation() {
    //navbar Scroll
    const navBar = document.getElementById("navBar");
    let navBarTick = false;
    document.body.addEventListener("scroll", _ => {
        const scrollPos = window.scrollY;
        if (navBarTick) return;
        navBarTick = true;
        window.requestAnimationFrame(() => {
            if (scrollPos >= NavBarTrigger) {
                if (!navBar.classList.has("floating")) {
                    navbar.classList.add("floating");
                }
            } else if (navBar.classList.has("floating")) {
                navbar.classList.remove("floating");
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
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchIcon");
    //searchFunc
    const search = function() {
        let value = searchInput.value.trim();
        if (value.length == 0) {
            searchInput.value = searchInput.value.trim();
            let currentPlaceholder = placeholders.indexOf(searchInput.placeholder);
            if (currentPlaceholder >= 0 && currentPlaceholder < placeholders.length - 1) currentPlaceholder++;
            else currentPlaceholder = 0;
            searchInput.placeholder = placeholders[currentPlaceholder];
        } else {
            const wrongChars = /[^\w\s\.,;]/g;
            let match = value.match(wrongChars);
            if (match && match.length > 0) {
                searchInput.value = "";
                match = [...new Set(match)];
                searchInput.placeholder = "Nie używaj: " + match.join(", ");
            } else {
                let destination = new URL("szukaj.html", window.location.origin);
                destination.searchParams.set("q", value);
                window.location.assign(destination.toString());
            }
        }
    }
    searchInput.addEventListener("keydown", e => {
        if (e && e.key.toLowerCase() !== "enter") return;
        search();
    });
    searchButton.addEventListener("click", search);
}


export default {
    init
}