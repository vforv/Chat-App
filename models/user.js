var bcrypt = require("bcrypt");
var _ = require("underscore");
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
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
        admin_id:{
            type: DataTypes.INTEGER
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
        		var returnDetails = _.pick(user,"id","email","createdAt", "updatedAt","admin_id");

        		return returnDetails;
        		},
                generateToken: function(type) {
                    try{
                        var stringData = JSON.stringify({id: this.get("id"), type: type});
                        var encryptData = cryptojs.AES.encrypt(stringData, 'tokenpassword123321').toString();
                        var token = jwt.sign({
                            token: encryptData
                        },"newpassforjwt");
                        return token;
                    }catch(e) {
                        return undefined;
                    }
                    
                }
        	},
            classMethods: {
                    loginAuth: function(email, password) {

                           return new Promise(function(resolve, reject) {

                            if (typeof email !== 'string' || typeof password !== 'string') {
                            return reject();
                            }

                            user.findOne({
                            where: {
                                email: email
                            }
                        }).then(function(user){
                            if(user && bcrypt.compareSync(password,user.password_hash)){
                                resolve(user);
                            } else {
                                reject();
                            }
                        }, function() {
                            reject();
                        });
                    });
                 },
                 findUserByToken: function(token) {
                    return new Promise(function(resolve, reject) {
                        try{

                            var jwtGet = jwt.verify(token, 'newpassforjwt');
                            var decryptData = cryptojs.AES.decrypt(jwtGet.token, 'tokenpassword123321');
                            var tokenData = JSON.parse(decryptData.toString(cryptojs.enc.Utf8));

                            user.findById(tokenData.id)
                            .then(function (user) {
                                resolve(user);
                            }, function() {
                                
                                reject();
                            });
                        }catch(e) {
                            reject();
                        }
                    });
                 }
            },
            hooks: {
                // beforeValidate: function(value, options) {
                //     value.email = value.email.toLowerCase();
                // }
            }
        	
     }
    );
    return user;
};