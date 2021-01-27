import {
    redirectToMain,
    redirect,
    goto
} from "../routingUtils.js";
import localData from "../localData.js";

export function logowanie() {
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
}


export function rejstracja() {
    localData.logOut();
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
                goto("/activation/status");
            }
        }).catch(() => {
            submitBtn.disabled = false;
        });
        e.preventDefault();
        return false;
    })
}

export async function activationStatus() {
    const statusBox = document.getElementById("actStatus");
    if (await localData.isLoggedIn()) {
        fetch("/api/activationstatus").then(res => res.json()).then(data => {
            if (data.status === 1) {
                statusBox.innerText = "Email został wysłany. Sprawdź swoją skrzynkę odbiorczą.";
            } else if (data.status === 2) {
                statusBox.innerText = "Konto zostało aktywowane pomyślnie.";
            } else redirectToMain();
            statusBox.classList.remove("invisible");
        });
    } else redirect("/logowanie");
}
export default {
    logowanie,
    rejstracja,
    activationStatus
}