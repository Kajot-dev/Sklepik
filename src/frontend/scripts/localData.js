


export function getnick() {
    return new Promise(function(resolve, reject) {
        let nick = sessionStorage.getItem("tempnick");
        if (!nick) {
            fetch("/api/users").then(res => {
                if (res.status === 200) {
                    res.json().then(data => {
                        sessionStorage.setItem("tempnick", data.nick);
                        resolve(data.nick);
                    });
                } else resolve(null);
            }).catch(() => {});
        } else resolve(nick);
    });
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

export default { currentCurrency, getnick, logOut, isLoggedIn };