var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('email');
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || 'development';
var sequelize;


if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
       dialect: 'postgres'
    });
} else {
    sequelize = new Sequelize('database', 'username', 'password', {
        host: "localhost",
        dialect: "sqlite",
        logging: function () {
        },
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        storage: 'chat.sqlite'
    });
}

var db = {};

db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;