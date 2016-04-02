angular.module("chat")
        .controller("ChatController", ChatData);

function ChatData() 
{
    var vm = this;
   var socket = io.connect();
    
    socket.emit("message", {
        message: "Pozz"
    });
    
    socket.on("message", function(message) {
        console.log(message);
    });
    
}
