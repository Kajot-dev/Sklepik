const path = require("path");
const utils = require("./utils");
const frontEndpath = path.join(__dirname, "../frontend");
const indexPath = path.join(frontEndpath, "index.html");
const databaseHelpers = require("./databaseHelpers");

function init(app) {
    app.get("/", (req, res) => {
        if (!databaseHelpers.refreshToken(req.session.token)) {
            req.session.token = undefined; //delete invalid token
        }
        res.sendFile(indexPath);
    });

    //defineAuth(app);

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
                if (!databaseHelpers.refreshToken(req.session.token)) {
                    req.session.token = undefined; //delete invalid token
                }
            }
            res.sendFile(processedPath, function(err) {
                if (!err) res.end();
                else if (err.code === "ENOENT") res.sendStatus(404);
                else res.sendStatus(500);
            });
        } else {
            res.status(403);
            res.end();
        }
    });
}

function defineAuth(app) {
    //logowanie
    app.post("/users", (req, res) => {
        let {
            email,
            password
        } = req.body;
        if (typeof email === "string" && typeof password === "string") {
            databaseHelpers.removeToken(req.session.token);
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
            const userID = utils.hash(email);
            if (databaseHelpers.isUser(userID)) {
                if (databaseHelpers.getHashedPass(userID) === utils.passHash(password)) {
                    const newToken = databaseHelpers.createToken(userID);
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
    app.put('/users', (req, res) => {
        let {
            email,
            password,
            username
        } = req.body;
        if (typeof email === "string" && typeof password === "string" && typeof username === "string") {
            databaseHelpers.removeToken(req.session.token);
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
            username = username.trim();
            if (!utils.stringHelper(username, {
                    minL: 2,
                    maxL: 20,
                })) {
                res.status(400);
                res.end("Błędna nazwa użytkownika!");
                return;
            }
            const userID = utils.hash(email);
            if (databaseHelpers.isUser(userID)) {
                res.status(400);
                res.end("Ten użytkownik już istnieje!");
            } else {
                databaseHelpers.createUser(userID, {
                    email,
                    password,
                    username
                });
                res.status(201);
                res.end();
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });

    app.delete("/users", (req, res) => {
        let {
            email,
            password
        } = req.body;
        if (typeof email === "string" && typeof password === "string") {
            databaseHelpers.removeToken(req.session.token);
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
            const userID = utils.hash(email);
            if (databaseHelpers.isUser(userID)) {
                if (databaseHelpers.getHashedPass(userID) === utils.passHash(password)) {
                    databaseHelpers.removeUser(userID);
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

    app.patch('/users', (req, res) => {
        let {
            email,
            password,
            username,
            oldPassword
        } = req.body;
        if (typeof email === "string" || (typeof password === "string" && typeof oldPassword === "string") || typeof username === "string") {
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

            if (username) username = username.trim();
            if (!utils.stringHelper(username, {
                    minL: 2,
                    maxL: 20,
                })) {
                username = undefined
            }

            if (typeof token == "string") {
                const userID = databaseHelpers.verifyToken(token);
                if (userID) {
                    if (email && databaseHelpers.hasUserEmail(email)) {
                        res.status(403);
                        res.end("Taki użytkownik już istnieje!");
                        return;
                    }
                    if (password || oldPassword) {
                        if (password && oldPassword) {
                            const hashedP = utils.passHash(oldPassword);
                            if (hashedP !== databaseHelpers.getHashedPass(userID)) {
                                res.sendStatus(401);
                                return;
                            }
                        } else {
                            res.status(400);
                            res.end("Jedno z haseł ma nieprawidłowy format");
                        }

                    } else password = undefined;
                    databaseHelpers.updateUser(userID, {
                        email,
                        password,
                        username
                    });
                    res.sendStatus(200);

                } else res.sendStatus(401);
            }
        } else {
            res.status(400);
            res.end("Brakuje danych!");
        }
    });

    app.get("/users", (req, res) => {
        if (typeof req.session.token == "string") {
            const userID = databaseHelpers.verifyToken(req.session.token.trim());
            if (userID) {
                const user = databaseHelpers.getUserCopy(userID);
                delete user.hashedPassword;
                res.send(user);
            } else res.sendStatus(401);
        } else res.sendStatus(401);
    });
}


module.exports = {
    init
};