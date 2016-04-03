var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var cors = require("cors");
var db = require("./db.js");
var PORT = process.env.PORT || 3000;
var bodyParser = require("body-parser");
var _ = require("underscore");

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser);


clients = {};
var id = 0;

app.get("/create", function (req, res) {
    db.user.create({
        name: "user1",
        admin_id: 1
    }).then(function (data) {
        res.status(200).send();
    }, function (data) {
        res.status(401).send();
        console.log(data);
    });
});


io.on('connection', function (socket) {

    //SAVE USER ID
    db.user.findOne({
        where: {
            id: id++
        }
    }).then(function (user) {
        clients[user.id] = socket;

        socket.emit("message", {
            message: user.id
        });
    });

    //PRIVATE MESSAGE
    socket.on("pm", function (data) {
        clients[data.id].emit("message", {
            message: data.message
        });
        
        //SAVE MESSAGE TO THE DATABASE
    });



    //SEND MESSAGE ALL IN PROJECT
    socket.on("group-message", function (message, userId) {
        db.user.findOne({
            where: {
                id: userId
            }
        }).then(function (user) {
            socket.join(user.admin_id);
            io.sockets.in(user.admin_id).emit('message', {
                message: user.name + " JOINED TO ROOM"
            });
        });
    });





    //PROJECTS CHAT ROOMS
//    socket.join("1Projekt");
//    socket.broadcast.to("1Projekt").emit("message", {
//        message: "Hello to room"
//    });

});


db.sequelize.sync()
        .then(function () {
            http.listen(PORT, function () {
                console.log("Server Sterted!");
            });
        });

