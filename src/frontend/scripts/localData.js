
let isLoginDataSaved = false;

export async function getnick() {
    if (!isLoginDataSaved) {
        await logIn();
    } 
    return sessionStorage.getItem("tempnick");
}

export function isLoggedIn() {
    return new Promise(function(resolve, reject) {
        fetch("/api/islogged").then(res => res.json()).then(data => resolve(data.status));
    });
}

export function currentCurrency() {
    let currency = localStorage.getItem("currency");
    if (!currency) {
        localStorage.setItem("currency", "PLN");
        return "PLN";
    } else return currency;
}

export function logOut() {
    fetch("/api/logout", {
        method: "POST",
    }).then(() => {
        //user logged out
    }).catch(err => {
        console.error(err);
    });
    sessionStorage.clear();
}

export function logIn() {
    return new Promise(function(resolve, reject) {
        fetch("/api/users").then(res => {
            if (res.status === 200) {
                res.json().then(data => {
                    sessionStorage.setItem("tempnick", data.nick);
                    resolve(true);
                });
            } resolve(null);
        }).catch(reject);
    })
}

export default { currentCurrency, getnick, logOut, isLoggedIn, logIn };