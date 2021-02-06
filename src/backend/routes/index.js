const path = require("path");
const utils = require("../utils");
const frontEndpath = path.join(__dirname, "../../frontend");
const indexPath = path.join(frontEndpath, "index.html");
const databaseHelpers = require("../databaseHelpers");
//routes
const defineAuth = require("./auth");
const defineProducts = require("./products");

function init(app) {
    app.get("/", async (req, res) => {
        if (!await databaseHelpers.refreshToken(req.session.token)) {
            req.session.token = undefined; //delete invalid token
        }
        res.status(200);
        try {
            res.sendFile(indexPath);
        } catch (e) {
            if (e.code === "ENOENT") res.redirect("/404");
            else if (e.code !== "ECONNABORTED") res.sendStatus(500);
        }
    });

    defineProducts(app);
    defineAuth(app);

    app.get("/profil", async (req, res) => {
        const token = req.session.token;
        if (typeof token === "string") {
            const userID = await databaseHelpers.verifyToken(token);
            if (userID) {
                const processedPath = path.join(frontEndpath, "profil/index.html");
                res.sendFile(processedPath, err => {
                    if (err && err.code !== "ECONNABORTED") res.sendStatus(500);
                });
            } else res.redirect("/logowanie");
        } else res.redirect("/logowanie");
    });

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
            res.sendFile(processedPath, e => {
                if (e) {
                    if (e.code === "ENOENT") {
                        if (req.baseUrl == "/404" || req.baseUrl == "/404.html" ) {
                            res.sendStatus(404);
                        } else res.redirect("/404");
                    }
                    else if (e.code !== "ECONNABORTED") res.sendStatus(500);
                }
            });
        } else {
            await res.status(403);
            await res.end();
        }
    });
}




module.exports = {
    init
};