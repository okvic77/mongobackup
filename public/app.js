const socket = io.connect();

const Database = React.createClass({
    getInitialState() {
        return {isWorking: false}
    },
    del() {
        socket.emit('del', this.props.database.id);
    },
    backup() {
      this.setState({isWorking:true})
        socket.emit('backup', this.props.database.id, done => {
          this.setState({isWorking:false})
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
            <div>
                <div>{this.props.database.name} {this.props.database.uri}</div>
                <div>{this.props.database.id}</div>
                <button className="uk-button uk-button-danger" onClick={this.del}>Del</button>
                <button className="uk-button uk-button-primary" onClick={this.backup} disabled={this.state.isWorking}>Backup</button>
                <form action="" className="uk-form" onSubmit={this.addCron}>
                  <input type="text" placeholder="cron" ref="cron"/>
                  <button className="uk-button" type="submit">Agregar cron</button>
                </form>

                <hr/>
            </div>
        )
    }
});

const Job = React.createClass({
    del() {
        socket.emit('delCron', this.props.job.id);
    },
    render() {
        let {job, database} = this.props;
        return (
            <div>
                <div>{job.id} {database.name}
                    {job.cron}</div>
                  <button className="uk-button uk-button-danger" onClick={this.del}>Del</button>
                <hr/>
            </div>
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
            {databases.map(database => <Database key={database.id} database={database}/>)}

            <form className="uk-form" action="" onSubmit={this.addDatabase}>
                <input type="text" ref="name" placeholder="Name"/>
                <input type="text" ref="uri" placeholder="mongodb://host:port/database"/>
                <button type="submit" className="uk-button">Add</button>
            </form>
            <hr/>
            <h3>Cron</h3>
            {jobs.map(job => <Job key={job.id} job={job} database={databases.find(d => job.database == d.id)}/>)}

            <Log/>
        </div>
    }
});

ReactDOM.render(
    <App/>, document.getElementById('root'));
