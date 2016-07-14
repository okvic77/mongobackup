const async = require('async');
const spawn = require('child_process').spawn,
    url = require('url'),
    fs = require('fs'),
    later = require('later');

var path = require('path');
var base = path.join(process.env.DATA_DIR || '/data', 'mongodump')

let {databases, file} = require('./data');
var mkdirp = require('mkdirp');

var cargo = module.exports = async.queue((id, callback) => {
    var database = databases.find({id}).value();
    var data = url.parse(database.uri);
    var filename = eval("`"+file.value()+"`");
    var dir = path.join(base, filename);

    if (!fs.existsSync(dir))
        mkdirp.sync(dir);
    var args = [
        //'--gzip',
        '--host',
        data.host,
        '--out',
        `${dir}/dump`
    ];

    if (data.pathname && data.pathname.length > 1) {
        args.push('--db', data.pathname.slice(1))
    }
    if (data.auth) {
        var parts = data.auth.split(':');
        args.push('--username', parts[0], '--password', parts[1]);
    }

    const backup = spawn('mongodump', args);
    var logs = {
        out: []
    }
    backup.stdout.on('data', (data) => {
        logs.out.push(data.toString('utf8').trim())
        io.emit('log', {
            type: 'info',
            data: data.toString('utf8').trim()
        })
    });

    backup.stderr.on('data', (data) => {
        logs.out.push(`error: ${data.toString('utf8').trim()}`)
        io.emit('log', {
            type: 'error',
            data: data.toString('utf8').trim()
        })
    });

    backup.on('close', (code) => {
        logs.exit = code;
        logs.date = Date.now();
        logs.dateFormated = new Date(),
        fs.writeFileSync(`${dir}/data.json`, JSON.stringify(logs, null, 4))
        callback(null, code);
    });

}, 1);
