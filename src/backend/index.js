const express = require("express");
const session = require("cookie-session");
const routes = require("./routes");
const cluster = require("cluster");
const colors = require("colors");
const worker = require("./worker");
const helmet = require("helmet");
const os = require("os");
const {
    config
} = require("./database");
const httpPort = process.env.PORT || 8000;


async function init() {
    if (cluster.isMaster) {
        console.log("Running in " + colors.yellow(process.env.NODE_ENV) + " environment!");

        cluster.fork({ threadID: 1}); //threading disabled due to the free hosting performance

        console.log("Worker is starting!");
        worker.init();
    } else {
        const app = express();

        if (process.env.NODE_ENV !== "testing") {
            
            app.use(helmet({
                contentSecurityPolicy: {
                    directives: Object.assign(helmet.contentSecurityPolicy.getDefaultDirectives(), {
                        frameSrc: ["'self'", "https://www.google.com/"],
                    })
                }
            }));
        }
        
        const sessionSecret = (await config).get("sessionSecret").value();
        const sessionName = (await config).get("sessionName").value();
        app.use(session({
            name: sessionName,
            secret: sessionSecret,
            saveUninitialized: true,
            resave: true,
            cookie: {
                secure: true,
                httpOnly: true,
                sameSite: true,
                maxAge: 1000 * 60 * 45,
                signed: true
            }
        }));
        app.use(express.urlencoded({
            extended: true
        }));
        app.use(express.json());

        routes.init(app);

        app.listen(httpPort);
        console.log(colors.magenta("HTTP") + " server thread " + colors.yellow(process.env.threadID) + " is listening on port: " + colors.green(httpPort));
    }
}
init();