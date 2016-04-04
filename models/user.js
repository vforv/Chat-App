var bcrypt = require("bcrypt");
var _ = require("underscore");

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate:{
            	isEmail: true
            }
        },
        salt:{
        	type: DataTypes.STRING
        },
        password_hash:{
        	type: DataTypes.STRING
        },
        password: {
        	type: DataTypes.VIRTUAL,
        	allowNull: false,
        	validate:{
        		len: [6,100]
        	},
        	set: function(pass) 
        	{
        		var salt = bcrypt.genSaltSync(10);
        		var hash = bcrypt.hashSync(pass, salt);

        		this.setDataValue("password_hash", hash);
        		this.setDataValue("salt", salt);
        		this.setDataValue("password", pass);

        	}
        }
        
    },
    {
        	instanceMethods: {
        		toPublicJSON: function() {
        		var user = this.toJSON();
        		var returnDetails = _.pick(user,"id","email","createdAt", "updatedAt");

        		return returnDetails;
        		}
        	}
        	
     }
    );
};