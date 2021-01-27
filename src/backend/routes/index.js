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




module.exports = {
    init
};