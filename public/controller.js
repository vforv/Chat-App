angular.module("chat")
        .controller("ChatController", ChatData);

function ChatData($scope)
{
    var vm = this;
    vm.sub = sub;
    vm.messages = [
    ];

    var socket = io.connect();
    
    socket.emit("pm", {
        message: "hey",
        id: 1
    });

    socket.on("message", function (message) {
        console.log(message);
        vm.messages.push(message);
         $scope.$apply(vm.messages);

    });


    function sub()
    {
        console.log(vm.message);
        socket.emit("message", {
            message: vm.message
        });
    }
}
