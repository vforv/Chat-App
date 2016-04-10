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
adminUsers = [];
adminIdUsers = {};

var id = 0;

app.post("/create/user", function (req, res) {
    var cred = _.pick(req.body,"email", "password", "admin_id");

    db.user.create({
        email: cred.email,
        password: cred.password,
        admin_id: cred.admin_id
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
            clients[user.id].user = user.toPublicJSON();
            clients[user.id].join(user.admin_id);

            //GET ALL SOCKETS IN ROOM
            var cli = io.sockets.adapter.rooms[user.admin_id].sockets;  


            function isLogged(idObj) {
                return (_.findWhere(adminUsers, idObj) == null) ? false : true;
            } 

            //to get the number of clients
            var numClients = (typeof cli !== 'undefined') ? Object.keys(cli).length : 0;
            
            for (var clientId in cli ) {
                 //this is the socket of each client in the room.
                 var clientSocket = io.sockets.connected[clientId];
                 
                 if (!isLogged({id: clientSocket.user.id})) {
                    adminUsers.push(clientSocket.user);
                    adminIdUsers[user.admin_id] = _.where(adminUsers, {admin_id: user.admin_id});
                    
                 }

                 //you can do whatever you need with this
                  io.sockets.in(user.admin_id).emit('user-online', {
                        user:  adminIdUsers[user.admin_id], 
                        number: numClients
                   });

            }

        });
    });

   
    
    
    //PRIVATE MESSAGE
    socket.on("pm", function (data) {
        clients[data.id].emit("message", {
            message: clients[data.id].user.email + " " +data.message
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



    socket.on('disconnect', function () {
        if(socket.user !== undefined) {
            setTimeout(function () {
            adminUsers = _.without(adminUsers, _.findWhere(adminUsers, {id: socket.user.id}));
            adminIdUsers[socket.user.admin_id] = _.without(adminIdUsers[socket.user.admin_id], _.findWhere(adminIdUsers[socket.user.admin_id], {id: socket.user.id}));
            socket.leave(socket.user.admin_id);
            delete clients[socket.user.id];
         }, 2000);
            
        }
        
        
    });

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

