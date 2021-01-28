const fsPromises = require("fs").promises;
const fsConstants = require("fs").constants;
function stringify(obj) {
    return JSON.stringify(obj, null, 2);
  }
class realAsync {
    constructor(
        source, {
            defaultValue = {},
            serialize = stringify,
            deserialize = JSON.parse
        } = {}
    ) {
        this.source = source
        this.defaultValue = defaultValue
        this.serialize = serialize
        this.deserialize = deserialize
    }
    read() {
        return new Promise((resolve, reject) => {
            fsPromises.access(this.source, fsConstants.R_OK).then(() => {
                fsPromises.readFile(this.source, {
                    encoding: "utf8"
                }).then(data => {
                    resolve(this.deserialize(data));
                }).catch(() => {
                    reject(new Error("Error reading the file!"));
                })
            }).catch(() => {
                fsPromises.writeFile(this.source, this.serialize(this.defaultValue), {
                    encoding: "utf8"
                }).then(() => {
                    resolve(this.defaultValue);
                }).catch((err) => {
                    console.error(err);
                    alert(err.code);
                    reject(new Error("Error creating file!"));
                })
            });
        });
    }
    write(data) {
        return new Promise((resolve, reject) => {
            fsPromises.writeFile(this.source, this.serialize(data), {
                encoding: "utf8"
            }).then(() => {
                resolve(this.defaultValue);
            }).catch(() => {
                reject(new Error("Error creationg file!"));
            });
        });
    }
}
module.exports = realAsync;