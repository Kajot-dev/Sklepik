const path = require("path");
const utils = require("./utils");
const frontEndpath = path.join(__dirname, "../frontend");
const indexPath = path.join(frontEndpath, "index.html");

function init(app) {
    app.get("/", (req, res) => {
        res.sendFile(indexPath);
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
            res.sendFile(processedPath);
        } else {
            res.status(403);
            res.end();
        }
    });
}

module.exports = { init };