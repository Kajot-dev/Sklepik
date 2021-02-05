
let isLoginDataSaved = false;

export async function getnick() {
    if (!isLoginDataSaved) {
        let data = await logIn();
        if (data) data = data.nick;
        return data;
    }
    return sessionStorage.getItem("tempnick");
}

export async function getFavourites() {
    if (!isLoginDataSaved) {
        let data = await logIn();
        if (data) data = data.favourites;
        return data;
    }
    return JSON.parse(sessionStorage.getItem("tempFavourites"));
}

export async function isInFavourites(ID) {
    if (!isLoginDataSaved) {
        let data = await logIn();
        if (data) {
            data = data.favourites;
            return data.includes(ID);
        }
        return false;
    }
    return JSON.parse(sessionStorage.getItem("tempFavourites")).includes(ID);
}

export function addToFavourites(ID) {
    return new Promise(async (resolve, reject) => {
        let favs = await getFavourites();
        if (!favs) return reject();
        favs.push(ID);
        fetch("/api/favourites/" + ID, {
            method: "POST"
        }).then(() => {
            sessionStorage.setItem("tempFavourites", JSON.stringify(favs));
            resolve(null);
        }).catch(reject);
    });
}

export function removeFromFavourites(ID) {
    return new Promise(async (resolve, reject) => {
        let favs = await getFavourites();
        if (!favs) return reject();
        let index = favs.indexOf(ID);
        if (index > -1) {
            favs.splice(index, 1);
        }
        fetch("/api/favourites/" + ID, {
            method: "DELETE"
        }).then(() => {
            sessionStorage.setItem("tempFavourites", JSON.stringify(favs));
            resolve();
        }).catch(reject);
    });
}

export function updateNick(nick) { //only locally
    sessionStorage.setItem("tempnick", nick);
}

export function isLoggedIn() {
    return new Promise(function(resolve, reject) {
        if (isLoginDataSaved) return resolve(true);
        fetch("/api/islogged").then(res => res.json()).then(data => resolve(data.status));
    });
}

export function getUserData() {
    return new Promise(function(resolve, reject) {
        fetch("/api/users").then(res => {
            if (res.ok) res.json().then(data => resolve(data));
            else resolve(null);
        }).catch((err) => {
            console.errror(err);
            resolve(null);
        });
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
    clearData();
}

function clearData() {
    isLoginDataSaved = false;
    localStorage.removeItem("tempCart");
    sessionStorage.removeItem("tempnick");
    sessionStorage.removeItem("tempFavourites");
}

export function logIn() {
    return new Promise(function(resolve, reject) {
        fetch("/api/islogged").then(res => res.json()).then(data => {
            if (data.status) {
                fetch("/api/users").then(res => {
                    if (res.status === 200) {
                        res.json().then(userObj => {
                            sessionStorage.setItem("tempnick", userObj.nick);
                            sessionStorage.setItem("tempFavourites", JSON.stringify(userObj.favourites));
                            isLoginDataSaved = true;
                            resolve(userObj);
                        });
                    } else resolve(null);
                }).catch(reject);
            } else {
                resolve(null);
            }
        });
    });
}

export function getCart() {
    let c = localStorage.getItem("tempCart");
    try {
        c = JSON.parse(c);
    } catch (e) {
        return {};
    }
    return c ? c : {};
}

export function addToCart(product, quantity = 1) {
    const cart = getCart();
    const id = product.getID();
    if (id in cart) {
        cart[id].quantity += quantity;
    } else {
        cart[id] = { 
            quantity: 1
        }
    }
    setCart(cart);
}

export function subtractFromCart(product, quantity = 1) {
    const cart = getCart();
    const id = product.getID();
    if (id in cart) { 
        if (cart[id].quantity > quantity) cart[id].quantity -= quantity;
        else delete cart[id];
        setCart(cart);
    }
}
export function setCartProduct(product, quantity = 1) {
    const cart = getCart();
    const id = product.getID();
    cart[id] = {
        quantity: quantity
    }
    setCart(cart);
}
export function removeFromCart(product) {
    const cart = getCart();
    const id = product.getID();
    delete cart[id];
    setCart(cart);
}

export function setCart(cartObj) {
    localStorage.setItem("tempCart", JSON.stringify(cartObj));
}
export default { currentCurrency, getnick, logOut, isLoggedIn, logIn, getUserData, updateNick, getCart, addToCart, subtractFromCart, clearData, setCartProduct, removeFromCart, getFavourites, addToFavourites, removeFromFavourites, isInFavourites };