var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || 'development';
var sequelize;


if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
       dialect: 'postgres'
    });
} else {
    sequelize = new Sequelize('chat', 'root', 'sifra15', {
        host: "localhost",
        dialect: "mysql",
        logging: function () {
        },
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        dialectOptions: {
            socketPath: "/var/run/mysql/mysql.sock"
        },
        define: {
            paranoid: true
        }
    });
}

var db = {};

db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;