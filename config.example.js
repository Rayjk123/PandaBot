module.exports.config = {
    identity: {
        username: "username",
        password: "oauth token"
    },
    channels: [
        "any channel (Streamer Username)"
    ],
    connection: {
        cluster: 'aws',
        reconnect: true
    },
    options: {
        debug: true
    }
};

module.exports.dbConfig = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database',
    reconnect: true
};