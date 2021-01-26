const path = require("path");
const utils = require("./utils");
const frontEndpath = path.join(__dirname, "../frontend");
const indexPath = path.join(frontEndpath, "index.html");
const databaseHelpers = require("./databaseHelpers");
const assert = require('assert').strict;
function init(app) {
    app.get("/", async (req, res) => {
        if (!await databaseHelpers.refreshToken(req.session.token)) {
            req.session.token = undefined; //delete invalid token
        }
        res.sendFile(indexPath);
    });

    defineProducts(app);
    defineAuth(app);

    app.get("*", async (req, res) => {
        const reqpath = decodeURI(req.path);
        let processedPath = path.join(frontEndpath, reqpath);
        if (processedPath.startsWith(frontEndpath)) {
            if (!utils.hasExtension(processedPath)) {
                let newPath = path.join(processedPath, "index.html");
                if (await utils.doesExist(newPath)) {
                    processedPath = newPath;
                } else {
                    newPath = processedPath + ".html";
                    if (await utils.doesExist(newPath)) processedPath = newPath;
                }
            }
            if (processedPath.endsWith(".html")) {
                if (!await databaseHelpers.refreshToken(req.session.token)) {
                    req.session.token = undefined; //delete invalid token
                }
            }
            res.sendFile(processedPath, function(err) {
                if (!err) res.end();
                else if (err.code === "ENOENT") res.sendStatus(404);
                else if (err.code !== "ECONNABORTED"){
                    res.sendStatus(500);
                }
            });
        } else {
            res.status(403);
            res.end();
        }
    });
}

function defineAuth(app) {
    //logowanie
    app.post("/api/users", async (req, res) => {
        let {
            email,
            password
        } = req.body;
        if (typeof email === "string" && typeof password === "string") {
            await databaseHelpers.removeToken(req.session.token);
            email = email.trim();
            if (!utils.isEmail(email)) {
                res.status(400);
                res.end("Błędny login!");
                return;
            }
            password = password.trim();
            if (!utils.stringHelper(password, {
                    minL: 8,
                    maxL: 30
                })) {
                res.status(400);
                res.end("Błędny format hasła!");
                return;
            }
            const userID = await utils.hash(email);
            if (await databaseHelpers.isUser(userID)) {
                if (await databaseHelpers.getHashedPass(userID) === await utils.passHash(password)) {
                    const newToken = await databaseHelpers.createToken(userID);
                    req.session.token = newToken;
                    res.status(200);
                    res.end();
                } else {
                    res.status(400);
                    res.end("Błędne hasło!");
                }
            } else {
                res.status(404);
                res.end("Błędny login!");
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });
    //rejstracja
    app.put('/api/users', async (req, res) => {
        let {
            email,
            password,
            nick
        } = req.body;
        if (typeof email === "string" && typeof password === "string" && typeof nick === "string") {
            await databaseHelpers.removeToken(req.session.token);
            email = email.trim();
            if (!utils.isEmail(email)) {
                res.status(400);
                res.end("Błędny email!");
                return;
            }
            password = password.trim();
            if (!utils.stringHelper(password, {
                    minL: 8,
                    maxL: 30,
                    reqNumbers: true,
                    reqSpecialChars: true
                })) {
                res.status(400);
                res.end("Błędny format hasła!");
                return;
            }
            nick = nick.trim();
            if (!utils.stringHelper(nick, {
                    minL: 2,
                    maxL: 20,
                })) {
                res.status(400);
                res.end("Błędna nazwa użytkownika!");
                return;
            }
            const userID = await utils.hash(email);
            if (await databaseHelpers.isUser(userID)) {
                res.status(400);
                res.end("Ten użytkownik już istnieje!");
            } else {
                await databaseHelpers.createUser(userID, {
                    email,
                    password,
                    nick
                });
                //instant login
                const newToken = await databaseHelpers.createToken(userID);
                req.session.token = newToken;
                res.status(201);
                res.end();
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });

    app.delete("/api/users", async (req, res) => {
        let {
            email,
            password
        } = req.body;
        if (typeof email === "string" && typeof password === "string") {
            await databaseHelpers.removeToken(req.session.token);
            email = email.trim();
            if (!utils.isEmail(email)) {
                res.status(400);
                res.end("Błędny login!");
                return;
            }
            password = password.trim();
            if (!utils.stringHelper(password, {
                    minL: 8,
                    maxL: 30
                })) {
                res.status(400);
                res.end("Błędny format hasła!");
                return;
            }
            const userID = await utils.hash(email);
            if (await databaseHelpers.isUser(userID)) {
                if (await databaseHelpers.getHashedPass(userID) === await utils.passHash(password)) {
                    await databaseHelpers.removeUser(userID);
                    res.status(200);
                    res.end();
                } else {
                    res.status(400);
                    res.end("Błędne hasło!");
                }
            } else {
                res.status(404);
                res.end("Błędny login!");
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });

    app.patch('/api/users', async (req, res) => {
        let {
            email,
            password,
            nick,
            oldPassword
        } = req.body;
        if (typeof email === "string" || (typeof password === "string" && typeof oldPassword === "string") || typeof nick === "string") {
            const token = req.session.token;

            if (email) email = email.trim();
            if (!utils.isEmail(email)) {
                email = undefined;
            }

            if (password) password = password.trim();
            if (!utils.stringHelper(password, {
                    minL: 8,
                    maxL: 30,
                    reqNumbers: true,
                    reqSpecialChars: true
                })) {
                password = undefined;
            }

            if (oldPassword) oldPassword = oldPassword.trim();
            if (!utils.stringHelper(oldPassword, {
                    minL: 8,
                    maxL: 30,
                    reqNumbers: true,
                    reqSpecialChars: true
                })) {
                oldPassword = undefined;
            }

            if (nick) nick = nick.trim();
            if (!utils.stringHelper(nick, {
                    minL: 2,
                    maxL: 20,
                })) {
                nick = undefined
            }

            if (typeof token == "string") {
                const userID = await databaseHelpers.verifyToken(token);
                if (userID) {
                    if (email && await databaseHelpers.hasUserEmail(email)) {
                        res.status(403);
                        res.end("Taki użytkownik już istnieje!");
                        return;
                    }
                    if (password || oldPassword) {
                        if (password && oldPassword) {
                            const hashedP = await utils.passHash(oldPassword);
                            if (hashedP !== await databaseHelpers.getHashedPass(userID)) {
                                res.sendStatus(401);
                                return;
                            }
                        } else {
                            res.status(400);
                            res.end("Jedno z haseł ma nieprawidłowy format");
                        }

                    } else password = undefined;
                    await databaseHelpers.updateUser(userID, {
                        email,
                        password,
                        nick
                    });
                    res.sendStatus(200);

                } else res.sendStatus(401);
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });

    app.get("/api/users", async (req, res) => {
        console.log(req.session.token);
        if (typeof req.session.token == "string") {
            const userID = await databaseHelpers.verifyToken(req.session.token.trim());
            if (userID) {
                const user = await databaseHelpers.getUserCopy(userID);
                delete user.hashedPassword;
                res.send(user);
            } else res.sendStatus(401);
        } else res.sendStatus(204);
    });

    app.get("/api/activate/:token", async (req, res) => {
        const token = req.params.token;
        const isSucces = await databaseHelpers.activateUser(token);
        if (isSucces) res.redirect("/activation/status");
        else res.sendStatus(404);
    });
    app.get("/api/islogged", async (req, res) => {
        const token = req.session.token;
        if (await databaseHelpers.verifyToken(token)) {
            res.send({ status: true});
        } else {
            res.send({ status: false});
        }
    });
    app.post("/api/logout", async (req, res) => {
        const token = req.session.token;
        const userID = await databaseHelpers.verifyToken(token);
        if (token) await databaseHelpers.removeUserTokens(userID);
        delete req.session.token;
        res.sendStatus(200);
    });
    app.get("/api/activationstatus", async (req, res) => {
        const token = req.session.token;
        console.log(token);
        const userID = await databaseHelpers.verifyToken(token);
        console.log(userID);
        res.status(200);
        if (userID) {

            if (await databaseHelpers.isUserAwaitingActivation(userID)) {
                res.send({ status: 1});
            } else if ((await databaseHelpers.getUser(userID)).activated) {
                res.send({ status: 2});
            } else {
                const user = await databaseHelpers.getUser(userID);
                await databaseHelpers.sendActivationMail({ email: user.email, nick: user.nick, userID});
                res.send({ status: 1});
            }
        } else res.sendStatus(404);   
    });
}

function defineProducts(app) {
    app.get("/api/products/:type", async (req, res) => {
        const type = req.params.type;
        let quantity = req.query.quantity;
        let sort = req.query.sort;
        let desc = req.query.desc;
        try {
            quantity = parseInt(quantity);
            assert.ok(quantity > 0);
        } catch (e) {
            quantity = undefined;
        }
        let products;
        switch(type) {
            case "all":
                products = await databaseHelpers.getAllProducts();
                break;
            case "random":
                if (!quantity) {
                    res.status(400);
                    res.end("Wymagana ilość!");
                    return;
                }
                products = await databaseHelpers.getRandomProducts(quantity);
                break;
            case "recent":
                if (!quantity) {
                    res.status(400);
                    res.end("Wymagana ilość!");
                    return;
                }
                products = await databaseHelpers.getRecentProducts(quantity);
                break;
            case "cheapest":
                if (!quantity) {
                    res.status(400);
                    res.end("Wymagana ilość!");
                    return;
                }
                products = await databaseHelpers.getCheapestProducts(quantity);
                break;
            default:
                res.sendStatus(404);
                return;
        }
        switch(sort) {
            case "date":
                products = products.sortBy(["dateCreated"]);
                if (desc == "true") products = products.reverse();
                res.send(products.value());
                break;
            case "price":
                products = products.sortBy(p => p.prices.PLN);
                if (desc == "true") products = products.reverse();
                res.send(products.value());
                break;
            case "name":
                products = products.sortBy(["name"])
                if (desc == "true") products = products.reverse();
                res.send(products.value());
                break;
            default:
                res.send(products.value());
                return;
        }
    });
}
module.exports = {
    init
};