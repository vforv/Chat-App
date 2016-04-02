var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var cors = require("cors");

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.static(__dirname + '/public'));


io.on('connection', function (socket) {
    console.log("user connect");
    
    socket.on("message", function(message){
        socket.broadcast.emit("message",message);
    });
        
    
    socket.emit('message',{
        message: "User logged!!!"
    });
});

http.listen(3000, function () {
    console.log("Hello server");
});