var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var cors = require("cors");
var db = require("./db.js");
var middleware = require('./middleware.js')(db);
var PORT = process.env.PORT || 3000;
var bodyParser = require("body-parser");
var _ = require("underscore");
var bcrypt = require("bcrypt");

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


clients = {};
users = {};
var id = 0;

app.post("/create/user", function (req, res) {
    var cred = _.pick(req.body,"email", "password");

    db.user.create({
        email: cred.email,
        password: cred.password
    }).then(function (data) {
        res.send(data.toPublicJSON());
    }, function (data) {
        res.status(400).send(data);
    });
});

var userInstance;

app.post("/login/user" ,function(req,res) {
    var cred = _.pick(req.body, "email", "password");

    db.user.loginAuth(cred.email, cred.password)
    .then(function (user) {
       userInstance = user;
       return db.token.create({
        token: user.generateToken("auth")
       });

    })
    .then(function(token) {
        res.send({
            token: token.token,
            user: userInstance
        });
    })
    .catch(function() {
        res.status(401).send();
    });


});

app.post("/logout/user" ,middleware.requireAuth,function(req,res) {
    db.token.destroy({
    where: {
        hash: req.hashToken
    }
    })
    .then(function(){
        res.status(200).send();
    }, function() {
        res.status(400).send();
    });

});



app.get("/user/get" ,middleware.requireAuth,function(req,res) {
    var user = req.user;
    res.send(user.toPublicJSON());
});

 io.on('connection', function (socket) {

     socket.on("login", function (data) {
        // SAVE USER ID
        db.user.findOne({
            where: {
                id: data.user.id
            }
        }).then(function (user) {
            clients[user.id] = socket;
            users[user.id] = user;
            clients[user.id].join(user.admin_id);
            
            socket.emit("message", {
                message: user.id
            });
        });
    });

   
    
    
    //PRIVATE MESSAGE
    socket.on("pm", function (data) {
        clients[data.id].emit("message", {
            message: users[data.id].email + " " +data.message
        });
        
        //SAVE MESSAGE TO THE DATABASE
    });



    //SEND MESSAGE ALL IN PROJECT
    // socket.on("group-message", function (message, userId) {
    //     db.user.findOne({
    //         where: {
    //             id: userId
    //         }
    //     }).then(function (user) {
    //         socket.join(user.admin_id);
    //         io.sockets.in(user.admin_id).emit('message', {
    //             message: user.name + " JOINED TO ROOM"
    //         });
    //     });
    // });





    //PROJECTS CHAT ROOMS
//    socket.join("1Projekt");
//    socket.broadcast.to("1Projekt").emit("message", {
//        message: "Hello to room"
//    });

});


db.sequelize.sync({force:false})
        .then(function () {
            http.listen(PORT, function () {
                console.log("Server Sterted!");
            });
        });

