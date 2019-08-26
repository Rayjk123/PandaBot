const mysql = require('promise-mysql');
const config = require('./config').dbConfig;

var exports = module.exports = {};

// connection parameters
const connectionParam = config;

exports.grabPointsByUser = function(username) {
    return mysql.createConnection(connectionParam)
        .then(function(connection) {
            let rows = connection.query('select points from points where username = ?', [username]);
            connection.end();
            return rows;
        })
        .then(function(rows) {
        	if (rows.length === 0) {
        		return 0;
			}

            return rows[0].points;
        })
        .catch(function(error) {
            console.log("grabPointsByUser threw an error");
            console.log(error);
        });
};

exports.incrementAllUsersPoints = function(usernames, points) {
	let insertData = [];
	usernames.forEach(function (row) {
        insertData.push([row, points]);
	});


    mysql.createConnection(connectionParam)
        .then(function(connection) {
            connection.query('insert into points (username, points) values ? ' +
				'on duplicate key update points = points + ?', [insertData, points]);
            connection.end();
        })
        .catch(function(error) {
            console.log("incrementAllUsersPoints threw an error");
            console.log(error);
            // throw error;
        });
};

exports.incrementUserPoints = function(username, numPoints) {
    mysql.createConnection(connectionParam)
        .then(function(connection) {
            connection.query('insert into points (username, points) values (?, ?) ' +
                'on duplicate key update points = points + ?', [username, numPoints, numPoints]);
            connection.end();
        })
        .catch(function(error) {
            console.log("incrementUserPoints threw an error");
            console.log(error);
            // throw error;
        });
};

exports.decreaseUserPoints = function(username, numPoints) {
    mysql.createConnection(connectionParam)
        .then(function(connection) {
            connection.query('insert into points (username, points) values (?, ?) ' +
                'on duplicate key update points = points - ?', [username, 0, numPoints]);
            connection.end();
        })
        .catch(function(error) {
            console.log("incrementUserPoints threw an error");
            console.log(error);
            // throw error;
        });
};

exports.connectionParam = connectionParam;
