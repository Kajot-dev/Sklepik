const path = require("path");
const utils = require("../utils");
const frontEndpath = path.join(__dirname, "../../frontend");
const indexPath = path.join(frontEndpath, "index.html");
const databaseHelpers = require("../databaseHelpers");
//routes
const defineAuth = require("./auth");
const defineProducts = require("./products");

function init(app) {

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
}




module.exports = {
    init
};