const express = require('express')


var app = express();
var server = require('http').Server(app);

global.io = require('socket.io')(server);


let {databases, jobs} = require('./data');

var backup = require('./worker');
require('./cron');
let update = () => io.emit('update', databases);
let updateJobs = () => io.emit('updateJobs', jobs);

io.on('connection', socket => {
    socket.on('init', () => {
        update();
        socket.emit('update', databases);
        socket.emit('updateJobs', jobs);
    })

    socket.on('add', data => {
        data.id = guid();
        databases.push(data).value();
        update();
    })

    socket.on('del', id => {
        databases.remove({id}).value();
        jobs.remove({database: id}).value();
        updateJobs();
        update();
    })

    socket.on('cron', data => {
      data.id = guid();
      jobs.push(data).value()
      updateJobs();
    })

    socket.on('delCron', id => {
        jobs.remove({id}).value();
        updateJobs();
    })

    socket.on('backup', (id, callback) => {
      backup.push(id, code => {
        callback(code);
      })
    })

});

app.set('view engine', 'pug');

app.use(express.static('public'))

app.get('/', function(req, res) {
    res.render('app');
});

server.listen(process.env.PORT || 3000, function() {
    console.log('Example app listening on port 3000!');
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
