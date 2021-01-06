const NavBarTrigger = 60;


function init() {
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
export default { init }