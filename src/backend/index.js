const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const routes = require("./routes");
const os = require("os");
const cluster = require("cluster");
const colors = require("colors");
const {
    config
} = require("./database");
const httpPort = process.env.PORT;

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork({ id: i+1 });
    }
} else {
    const app = express();


    app.use(session({
        secret: config.get('sessionSecret').value(),
        resave: true,
        saveUninitialized: true
    }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    routes.init(app);

    app.listen(httpPort);
    console.log(colors.magenta("HTTP")+" server thread "+colors.blue(process.env.id)+" is listening on port: "+colors.green(httpPort));
}