const low = require('lowdb'),
    fs = require('fs'),
    path = require('path');

var configDb = {};

if (process.env.SECRET) {
    const Cryptr = require('cryptr'),
        cryptr = new Cryptr(process.env.SECRET);
    configDb.format = {
        deserialize: str => JSON.parse(cryptr.decrypt(str)),
        serialize: obj => cryptr.encrypt(JSON.stringify(obj))
    }
}

const base = process.env.DATA_DIR || '/data',
    mongodump = path.join(base, 'mongodump');

var config = path.join(base, 'db.json')

if (!fs.existsSync(base))
    fs.mkdirSync(base);

if (!fs.existsSync(mongodump))
    fs.mkdirSync(mongodump);

const db = low(config, configDb)

db.defaults({databases: [], jobs: [], file: "${database.id}/${new Date().toISOString()}"}).value()

module.exports = {
    databases: db.get('databases'),
    jobs: db.get('jobs'),
    file: db.get('file')
};
