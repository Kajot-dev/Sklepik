


export function getUserName() {
    return new Promise(function(resolve, reject) {
        let username = sessionStorage.getItem("tempUserName");
        if (!username) {
            fetch("/api/users").then(res => {
                if (res.status === 200) {
                    res.json().then(data => {
                        sessionStorage.setItem("tempUserName", data.username);
                        resolve(data.username);
                    });
                } else resolve(null);
            }).catch(() => {});
        } else resolve(username);
    });
}


export function currentCurrency() {
    let currency = localStorage.getItem("currency");
    if (!currency) {
        localStorage.setItem("currency", "PLN");
        return "PLN";
    }
}

export function logOut() {
    sessionStorage.clear();
}

export default { currentCurrency, getUserName, logOut };