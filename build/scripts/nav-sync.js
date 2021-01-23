const fsPromises = require("fs").promises;
const { parse } = require("node-html-parser");
const path = require("path");

async function start() {
    //get the boilerplate
    let template = await fsPromises.readFile(path.join(__dirname,"../nav-boilerplate.html"), { encoding: "utf8" });
    const templateRoot = parse(template, { comments: true });
    const head = templateRoot.querySelector("head").innerHTML;
    const header = templateRoot.querySelector("header").innerHTML;
    const footer = templateRoot.querySelector("footer").innerHTML;
    const targets = await findHTML(path.join(__dirname,"../../src/frontend"));

    for (let t of targets) {
        let content = await fsPromises.readFile(t, { encoding: "utf8" });
        content = content.slice(content.indexOf("<!DOCTYPE html>\n") + "<!DOCTYPE html>\n".length);
        let contentRoot = parse(content, { comments: true });
        let contentHead = contentRoot.querySelector("head");
        let contentHeader = contentRoot.querySelector("header");
        let contentFooter = contentRoot.querySelector("footer");
        contentHead.set_content(head);
        contentHeader.set_content(header);
        contentFooter.set_content(footer);
        let result = contentRoot.querySelector("html").toString().trim();
        result = "<!DOCTYPE html>\n" + result;
        await fsPromises.writeFile(t, result, { encoding: "utf-8"});
    }
}

async function findHTML(dir) {
    let filelist = [];
    let list = await fsPromises.readdir(dir, { encoding: "utf8" , withFileTypes: true});
    for (let e of list) {
        if (e.isFile() && [".htm", ".html"].includes(path.extname(e.name))) {
            filelist.push(path.join(dir, e.name));
        } else if (e.isDirectory()) {
            filelist.push(...await findHTML(path.join(dir, e.name)));
        }
    }
    return filelist;
}
start();