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
                localData.clearData();
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
    const loginForm = document.getElementById("login");
    const errorBox = document.getElementById("error");
    const submitBtn = loginForm.querySelector(`button[type="submit"]`);
    loginForm.addEventListener("submit", e => {
        localData.logOut();
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
            if (data.status === 0) {
                statusBox.innerText = "Email właśnie został wysłany. Sprawdź swoją skrzynkę odbiorczą.";
            } else if (data.status === 1) {
                statusBox.innerText = "Email został już wcześniej wysłany. Sprawdź swoją skrzynkę odbiorczą.";
            } else if (data.status === 2) {
                statusBox.innerText = "Konto zostało aktywowane pomyślnie.";
            } else redirectToMain();
            statusBox.classList.remove("invisible");
        });
    } else redirect("/logowanie");
}

export async function profil() {
    const userData = document.getElementById("userdata");
    const nickInput = userData.querySelector(`input[name="nick"]`);
    const emailInput = userData.querySelector(`input[name="email"]`);
    const oldPassInput = userData.querySelector(`input[name="oldpassword"]`);
    const passInput = userData.querySelector(`input[name="password"]`);
    const submitBtn = userData.querySelector(`[type="submit"]`);
    const allInputs = [nickInput, emailInput, oldPassInput, passInput];
    const delBtn = document.getElementById("delete-account");
    const errorBox = document.getElementById("profile-error");
    let user = await updateUserFields(...allInputs);
    if (user) {
        const loginButton = document.getElementById("loginText");
        userData.addEventListener("submit", e => {
            e.preventDefault();
            disableAll(...[...allInputs, submitBtn]);
            let updatedUserObj = {};
            if (nickInput.value.trim() !== "") updatedUserObj.nick = nickInput.value.trim();
            if (emailInput.value.trim() !== "") updatedUserObj.email = emailInput.value.trim();
            if (oldPassInput.value.trim() !== "" && passInput.value.trim() !== "") {
                updatedUserObj.oldPassword = oldPassInput.value.trim();
                updatedUserObj.password = passInput.value.trim();
            }
            if (Object.keys(updatedUserObj).length > 0) {
                fetch("/api/users", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedUserObj)
                }).then(async res => {
                    console.log(res.status)
                    if (res.ok) {
                        user = await updateUserFields(...allInputs);
                        submitBtn.disabled = false;
                        localData.updateNick(user.nick);
                        loginButton.innerText = user.nick;
                    } else {
                        res.text().then(t => {
                            errorBox.style.animation = "";
                            window.requestAnimationFrame(() => {
                                errorBox.innerText = t;
                                errorBox.classList.remove("invisible");
                                errorBox.style.animation = "pulse-red 0.5s ease 2";
                            });
                            enableAll(...allInputs);
                            submitBtn.disabled = false;
                        });
                    }

                }).catch(err => {
                    submitBtn.disabled = false;
                    console.log(err);
                })
            }
        });
        delBtn.addEventListener("click", e => {
            if (confirm("Czy na pewno chcesz usunąć swoje konto?")) {
                fetch("/api/users", {
                    method: "DELETE"
                }).then(res => {
                    if (res.ok) {
                        localData.clearData();
                        goto("/");
                    }
                });
            }
        }, {
            once: true
        });
    } else redirect("/logowanie");
}
async function updateUserFields(nickInput, emailInput, oldPassInput, passInput) {
    const user = await localData.getUserData();
    if (user) {
        nickInput.value = user.nick;
        emailInput.value = user.email;
        oldPassInput.value = "";
        passInput.value = "";
        enableAll(nickInput, emailInput, oldPassInput, passInput);
    }
    return user;
}

function disableAll(...inputs) {
    for (const i of inputs) i.setAttribute("disabled", "");
}
function enableAll(...inputs) {
    for (const i of inputs) i.removeAttribute("disabled", "");
}

export default {
    logowanie,
    rejstracja,
    activationStatus,
    profil
}