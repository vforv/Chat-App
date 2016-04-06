cryptojs = require("crypto-js");

module.exports = function(db) {
	return {
		requireAuth: function(req,res,next) {

			var token = req.get("Auth") || req.query.Auth;
			
			var hashToken = cryptojs.MD5(token).toString();

			db.token.findOne({
				where: {
					hash: hashToken
				}
			})
			.then(function(data){
				if(data) {
					db.user.findUserByToken(token)
				.then(function(user) {
					req.user = user;
					req.hashToken = hashToken;
					next();
				}, function() {
					res.status(401).send();
				});
			}else{
			res.status(401).send();	
			}
				
			},function() {
				res.status(401).send();
			});
			
		}
	}
	
}