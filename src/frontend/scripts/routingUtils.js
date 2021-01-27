
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
    redirectToMain,
    redirect,
    goto
};