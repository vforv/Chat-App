var cryptojs = require("crypto-js")

module.exports = function(sequelize, DataTypes) {
	return sequelize.define("token", {
			token: {
				type: DataTypes.VIRTUAL,
				allowNull: false,
				validate: {
					len: [1]
				},
				set: function(token) {
				hash = cryptojs.MD5(token).toString();

				this.setDataValue('token', token);
                this.setDataValue('hash', hash);
			}
			},
			hash: DataTypes.STRING,
			
	})
}