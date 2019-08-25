const mysql = require('mysql2');

var exports = module.exports = {};

// create the connection to database
const connection = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'root',
	password: 'hyperion',
	database: 'twitchbot'
});

exports.grabPointsByUser = function(username) {
	connection.query('select points from points where username = ?', [username], (error, rows, fields) => {
		if (error) {
			throw error;
		}
		if (rows.length === 0) {
			return 0;
		}
	});
}
