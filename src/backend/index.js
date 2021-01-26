const express = require("express");
const session = require("cookie-session");
const bodyParser = require("body-parser");
const routes = require("./routes");
const os = require("os");
const cluster = require("cluster");
const colors = require("colors");
const worker = require("./worker");
const helmet = require("helmet");
const path = require("path");
const {
    config
} = require("./database");
const httpPort = process.env.PORT || 8000;


async function init() {
    if (cluster.isMaster) {
        const app = express();

        app.use(helmet({
            contentSecurityPolicy: {
                directives: Object.assign(helmet.contentSecurityPolicy.getDefaultDirectives(), {
                    frameSrc: ["'self'", "https://www.google.com/"],
                })
            }
        }));
        const sessionSecret = (await config).get("sessionSecret").value();
        const sessionName = (await config).get("sessionName").value();
        console.log(sessionName, sessionSecret);
        app.use(session({
            secret: sessionSecret,
            saveUninitialized: true,
            resave: false,
            name: sessionName,
            cookie: {
                httpOnly: true,
                sameSite: true,
                maxAge: 1000 * 60 * 45,
                signed: true,
                secure: true
            }
        }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        routes.init(app);

        app.listen(httpPort);
        console.log(colors.magenta("HTTP") + " server is listening on port: " + colors.green(httpPort));
        cluster.fork();
    } else {
        console.log("Worker is starting!");
        worker.init();
    }





}
init();