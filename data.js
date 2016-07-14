const low = require('lowdb'),
    fs = require('fs');

var configDb = {};

if (process.env.SECRET) {
    const Cryptr = require('cryptr'),
        cryptr = new Cryptr('my secret key');
    configDb.format = {
        deserialize: str => JSON.parse(cryptr.decrypt(str)),
        serialize: obj => cryptr.encrypt(JSON.stringify(obj))
    }
}

const base = process.env.DATA_DIR || '/data';

var path = require('path');
var config = path.join(base, 'db.json')

console.log('config', base);

if (!fs.existsSync(base))
    fs.mkdirSync(base);

const db = low(config, configDb)

db.defaults({databases: [], jobs: []}).value()

module.exports = {
    databases: db.get('databases'),
    jobs: db.get('jobs')
};
