const databaseHelpers = require("../databaseHelpers");
const utils = require("../utils");


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

            if (password) {
                password = password.trim();
                if (!utils.stringHelper(password, {
                        minL: 8,
                        maxL: 30,
                        reqNumbers: true,
                        reqSpecialChars: true
                    })) {
                    res.status(400);
                    return res.end("Nieprawidłowy format nowego hasła!");
                }
            }

            if (oldPassword) {
                oldPassword = oldPassword.trim();
                if (!utils.stringHelper(oldPassword, {
                        minL: 8,
                        maxL: 30,
                        reqNumbers: true,
                        reqSpecialChars: true
                    })) {
                    res.status(400);
                    return res.end("Nieprawidłowy format starego hasła!")
                }
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
                    const userObj = await databaseHelpers.getUser(userID);
                    if (userObj.nick === nick) nick = undefined;
                    if (userObj.email === email) email = undefined;
                    if (email && await databaseHelpers.hasUserEmail(email)) {
                        res.status(403);
                        res.end("Taki użytkownik już istnieje!");
                        return;
                    }
                    if (password && oldPassword) {
                        const hashedP = await utils.passHash(oldPassword);
                        if (password === oldPassword) {
                            res.status(400);
                            res.end("Hasła nie mogą być takie same!");
                            return;
                        }
                        if (hashedP !== await databaseHelpers.getHashedPass(userID)) {
                            res.status(401);
                            res.end("Błędne hasło")
                            return;
                        }
                    }
                    if (password || nick || email) {
                        await databaseHelpers.updateUser(userID, {
                            email,
                            password,
                            nick
                        });
                    }
                    res.sendStatus(200);

                } else res.sendStatus(401);
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });

    app.get("/api/users", async (req, res) => {
        if (typeof req.session.token == "string") {
            const userID = await databaseHelpers.verifyToken(req.session.token.trim());
            if (userID) {
                const user = await databaseHelpers.getUserCopy(userID);
                delete user.hashedPassword;
                res.status(200);
                res.send(user);
            } else res.sendStatus(401);
        } else res.sendStatus(401);
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
            res.send({
                status: true
            });
        } else {
            res.send({
                status: false
            });
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
        const userID = await databaseHelpers.verifyToken(token);
        res.status(200);
        if (userID) {

            if (await databaseHelpers.isUserAwaitingActivation(userID)) {
                res.send({
                    status: 1
                });
            } else if ((await databaseHelpers.getUser(userID)).activated) {
                res.send({
                    status: 2
                });
            } else {
                const user = await databaseHelpers.getUser(userID);
                databaseHelpers.sendActivationMail({
                    email: user.email,
                    nick: user.nick,
                    userID
                });
                res.send({
                    status: 0
                });
            }
        } else res.sendStatus(404);
    });
}

module.exports = defineAuth;