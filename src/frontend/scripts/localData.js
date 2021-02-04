
let isLoginDataSaved = false;

export async function getnick() {
    if (!isLoginDataSaved) {
        let data = await logIn();
        if (data) data = data.nick;
        return data;
    }
    return sessionStorage.getItem("tempnick");
}

export function updateNick(nick) {
    sessionStorage.setItem("tempnick", nick);
}

export function isLoggedIn() {
    return new Promise(function(resolve, reject) {
        fetch("/api/islogged").then(res => res.json()).then(data => resolve(data.status));
    });
}

export function getUserData() {
    return new Promise(function(resolve, reject) {
        fetch("/api/users").then(res => {

            if (res.ok) res.json().then(data => resolve(data));
            else resolve(null);
        }).catch((err) => {
            console.log(err);
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
    localStorage.removeItem("tempCart");
    sessionStorage.removeItem("tempnick");
}

export function logIn() {
    return new Promise(function(resolve, reject) {
        fetch("/api/islogged").then(res => res.json()).then(data => {
            if (data.status) {
                fetch("/api/users").then(res => {
                    if (res.status === 200) {
                        res.json().then(userObj => {
                            sessionStorage.setItem("tempnick", userObj.nick);
                            isLoginDataSaved = true;
                            resolve(userObj);
                        });
                    } else resolve(null);
                }).catch(reject);
            } else resolve(null);
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
export default { currentCurrency, getnick, logOut, isLoggedIn, logIn, getUserData, updateNick, getCart, addToCart, subtractFromCart, clearData, setCartProduct, removeFromCart };