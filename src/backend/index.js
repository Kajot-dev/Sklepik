const express = require("express");
const session = require("cookie-session");
const bodyParser = require("body-parser");
const routes = require("./routes");
const os = require("os");
const cluster = require("cluster");
const colors = require("colors");
const worker = require("./worker");
const helmet = require("helmet");
const {
    config
} = require("./database");
const httpPort = process.env.PORT || 8000;


async function init() {
    if (cluster.isMaster) {
        
        
        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork({ id: i+1 });
        }

        console.log("Worker is starting!");
        worker.init();
    } else {
        const app = express();
    
        app.use(helmet({
            contentSecurityPolicy: {
              directives: Object.assign(helmet.contentSecurityPolicy.getDefaultDirectives(), {
                frameSrc: ["'self'", "https://www.google.com/"],
              })
            }
          }));
        app.use(session({
            secret: (await config).get("sessionSecret").value(),
            saveUninitialized: true,
            resave: false,
            name: (await config).get("sessionName").value(),
            cookie: {
                secure: true,
                httpOnly: true,
                sameSite: true,
                maxAge: 1000 * 60 * 45,
                signed: true
            }
            }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
    
        routes.init(app);
    
        app.listen(httpPort);
        console.log(colors.magenta("HTTP") + " server thread " + colors.yellow(process.env.id) + " server is listening on port: "+colors.green(httpPort));
        
    }
}
init();