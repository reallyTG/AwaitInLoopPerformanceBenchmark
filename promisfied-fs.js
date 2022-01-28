"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walk = exports.access = exports.directoryExists = exports.fileExists = exports.openTempFile = exports.close = exports.unlink = exports.rmDir = exports.cpFile = exports.cpDir = exports.cp = exports.mkTempDir = exports.mkdir = exports.exists = exports.write = exports.writeFile = exports.readdir = exports.readFile = exports.read = exports.open = exports.stat = void 0;
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const temp = require("temp");
temp.track();
async function stat(path) {
    return (await callFs(fs.stat, path))[0];
}
exports.stat = stat;
async function open(path, flags, mode) {
    return (await callFs(fs.open, path, flags, mode))[0];
}
exports.open = open;
async function read(fd, buffer, offset, length, position) {
    const result = await callFs(fs.read, fd, buffer, offset, length, position);
    return { bytesRead: result[0], buffer: result[1] };
}
exports.read = read;
async function readFile(...args) {
    return (await callFs(fs.readFile, ...args))[0];
}
exports.readFile = readFile;
async function readdir(path) {
    return (await callFs(fs.readdir, path))[0];
}
exports.readdir = readdir;
async function writeFile(filename, data) {
    return (await callFs(fs.writeFile, filename, data))[0];
}
exports.writeFile = writeFile;
async function write(fd, data) {
    return (await callFs(fs.write, fd, data, 0, data.length))[0];
}
exports.write = write;
function exists(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err) => {
            if (err) {
                if (err.code === "ENOENT") {
                    resolve(false);
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.exists = exists;
function mkdir(path) {
    return callFs(fs.mkdir, path).then(() => {
        return;
    });
}
exports.mkdir = mkdir;
function mkTempDir(affixes) {
    return callTemp(temp.mkdir, affixes);
}
exports.mkTempDir = mkTempDir;
async function cp(source, target) {
    const sourceStats = await stat(source);
    if (sourceStats.isDirectory()) {
        await cpDir(source, target);
    }
    else {
        await cpFile(source, target);
    }
}
exports.cp = cp;
async function cpDir(source, target) {
    if (!(await exists(target))) {
        createLongPath(target);
    }
    const files = await readdir(source);
    const cpPromises = [];
    for (let i = 0; i < files.length; i++) {
        const sourceEntry = path.join(source, files[i]);
        const targetEntry = path.join(target, files[i]);
        cpPromises.push(cp(sourceEntry, targetEntry));
    }
    await Promise.all(cpPromises);
}
exports.cpDir = cpDir;
function cpFile(source, target) {
    return new Promise((resolve, reject) => {
        const targetFolder = path.dirname(target);
        if (!fs.existsSync(targetFolder)) {
            createLongPath(targetFolder);
        }
        const sourceStream = fs.createReadStream(source);
        const targetStream = fs.createWriteStream(target);
        targetStream.on("close", () => resolve());
        targetStream.on("error", (err) => reject(err));
        sourceStream.pipe(targetStream);
    });
}
exports.cpFile = cpFile;
function rmDir(source, recursive = true) {
    if (recursive) {
        return new Promise((resolve, reject) => {
            rimraf(source, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    else {
        return callFs(fs.rmdir, source).then(() => {
            return;
        });
    }
}
exports.rmDir = rmDir;
function unlink(filePath) {
    return callFs(fs.unlink, filePath).then(() => {
        return;
    });
}
exports.unlink = unlink;
function close(fd) {
    return callFs(fs.close, fd).then(() => {
        return;
    });
}
exports.close = close;
function openTempFile(...args) {
    return callTemp(temp.open, ...args);
}
exports.openTempFile = openTempFile;
async function fileExists(path) {
    return await pathExists(path, true);
}
exports.fileExists = fileExists;
async function directoryExists(path) {
    return await pathExists(path, false);
}
exports.directoryExists = directoryExists;
async function access(path, mode) {
    return callFs(fs.access, path, mode).then(() => {
        return;
    });
}
exports.access = access;
async function walk(dir) {
    const stats = await stat(dir);
    if (stats.isDirectory()) {
        let files = [];
        for (const file of await readdir(dir)) {
            files = files.concat(await walk(path.join(dir, file)));
        }
        return files;
    }
    else {
        return [dir];
    }
}
exports.walk = walk;
async function pathExists(path, isFile) {
    let stats = null;
    try {
        stats = await stat(path);
    }
    catch (err) {
        return false;
    }
    return isFile === stats.isFile();
}
function createLongPath(target) {
    let targetFolder = target;
    const notExistsFolder = [];
    while (!fs.existsSync(targetFolder)) {
        notExistsFolder.push(path.basename(targetFolder));
        targetFolder = path.resolve(targetFolder, "..");
    }
    notExistsFolder.reverse().forEach((element) => {
        targetFolder = path.resolve(targetFolder, element);
        fs.mkdirSync(targetFolder);
    });
}
function callFs(func, ...args) {
    return new Promise((resolve, reject) => {
        func.apply(fs, args.concat([
            (err, ...args) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(args);
                }
            },
        ]));
    });
}
function callTemp(func, ...args) {
    return new Promise((resolve, reject) => {
        func.apply(temp, args.concat([
            (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            },
        ]));
    });
}
