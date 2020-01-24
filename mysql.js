var mysql = require('mysql');
var dotenv = require('dotenv');
dotenv.config()

function getConnection() {
    var connection = mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    return connection
}

module.exports = {
    getConnection
}