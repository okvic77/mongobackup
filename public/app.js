const socket = io.connect();

const Database = React.createClass({
    getInitialState() {
        return {isWorking: false}
    },
    del() {
        socket.emit('del', this.props.database.id);
    },
    backup() {
        this.setState({isWorking: true})
        socket.emit('backup', this.props.database.id, done => {
            this.setState({isWorking: false})
        });
    },
    addCron(event) {
        let {cron} = this.refs;
        socket.emit('cron', {
            database: this.props.database.id,
            cron: cron.value
        });
        cron.value = '';
        event.preventDefault();
    },
    render() {
        return (

            <tr>
                <td>{this.props.database.name}</td>
                <td>
                    {this.props.database.uri}</td>
                <td>
                    <button className="uk-button uk-button-danger" onClick={this.del}>Del</button>
                    <button className="uk-button uk-button-primary" onClick={this.backup} disabled={this.state.isWorking}>Backup</button>
                    <form action="" className="uk-form" onSubmit={this.addCron}>
                        <input type="text" placeholder="cron" ref="cron"/>
                        <button className="uk-button" type="submit">Add cron</button>
                    </form>
                </td>
            </tr>
        )
    }
});

const Job = React.createClass({
    del() {
        socket.emit('delCron', this.props.job.id);
    },
    getInitialState() {
        return {secondsElapsed: 0};
    },
    componentDidMount: function() {
        this.interval = setInterval(this.tick, 1000);
    },
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },

    tick() {
      this.setState({secondsElapsed: this.state.secondsElapsed + 1});
    },

    render() {
        let {job, database} = this.props;
        var next = 'waiting to set date', nextText = '';
        if (job.next) {
            next = moment(job.next).format('MMMM Do YYYY, h:mm:ss a');
            nextText = moment(job.next).from(moment());
        }

        return (
            <tr>
                <td>{database.name}</td>
                <td>{job.cron}
                    <br/>
                    Next run {next}, {nextText}</td>
                <td>
                    <button className="uk-button uk-button-danger" onClick={this.del}>Del</button>
                </td>
            </tr>
        )
    }
});

const Log = React.createClass({
    getInitialState() {
        return {log: []}
    },
    componentWillMount() {
        socket.on('log', log => {
            var newState = React.addons.update(this.state, {
                log: {
                    $push: [log]
                }
            });

            this.setState(newState);
        });
    },
    render() {
        let {log} = this.state;
        return (
            <div>log {log.map((log, index) => (
                    <div key={index}>{log.data}</div>
                ))}
            </div>
        )
    }
});

const App = React.createClass({

    getInitialState() {
        return {databases: [], jobs: []};
    },

    componentWillMount() {
        socket.on('update', databases => {
            this.setState({databases});
        });
        socket.on('updateJobs', jobs => {
            this.setState({jobs});
        });
        socket.emit('init');
    },
    addDatabase(event) {
        let {name, uri} = this.refs;
        socket.emit('add', {
            name: name.value,
            uri: uri.value
        })
        name.value = '';
        uri.value = '';
        event.preventDefault();
    },
    render() {
        let {databases, jobs} = this.state;
        return <div>

            <h3>Databases</h3>
            <table className="uk-table uk-table-hover uk-table-striped uk-table-condensed">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>URL</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>

                    {databases.map(database => <Database key={database.id} database={database}/>)}
                </tbody>
            </table>

            <form className="uk-form" action="" onSubmit={this.addDatabase}>
                <h3>Add new database</h3>
                <input type="text" ref="name" placeholder="Name"/>
                <input type="text" ref="uri" className="uk-form-width-large" placeholder="mongodb://host:port/database"/>
                <button type="submit" className="uk-button">Add database</button>
            </form>
            <hr/>
            <h3>Cron</h3>

            <table className="uk-table uk-table-hover uk-table-striped uk-table-condensed">
                <thead>
                    <tr>
                        <th>Database</th>
                        <th>Cron</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map(job => <Job key={job.id} job={job} database={databases.find(d => job.database == d.id)}/>)}
                </tbody>
            </table>

            <Log/>
        </div>
    }
});

ReactDOM.render(
    <App/>, document.getElementById('root'));
