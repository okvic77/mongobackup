const later = require('later'), async = require('async');
var backup = require('./worker');

let {databases, jobs} = require('./data');

let updateJobs = () => io.emit('updateJobs', jobs);

async.forever(
    function(next) {
        // next is suitable for passing to things that need a callback(err [, whatever]);
        // it will result in this function being called again.
        var now = Date.now();
        async.each(jobs.value(), (job, done) => {

          let {database, cron, id, next} = job;


          if (next) {
            if (next < now && (now - next) > 1000) {
              console.log('run');
              var s = later.parse.cron(cron, true);
              jobs.find({id}).assign({next:later.schedule(s).next().getTime()}).value();
              updateJobs();
              backup.push(database, done);
            } else {
              done()
            }
          } else {
            console.log('init');
            updateJobs();
            var s = later.parse.cron(cron, true);
            jobs.find({id}).assign({next:later.schedule(s).next().getTime()}).value()
            done()
          }

        }, err => {
          setTimeout(next, 1000);
        })

    },
    function(err) {
        // if next is called with a value in its first parameter, it will appear
        // in here as 'err', and execution will stop.
    }
);
