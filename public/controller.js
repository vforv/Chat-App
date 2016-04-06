angular.module("chat")
        .controller("ChatController", ChatData);

function ChatData($scope,$http, $routeParams)
{
    

    var vm = this;
    vm.sub = sub;
    vm.messages =[];
    

    var socket = io.connect();

    var i = 0;

    
     $http.get("/user/get/?Auth=" + $routeParams.token)
      .then(function(user){
       socket.emit("login",{
          user: user.data
       }) 
    },function(){

    });
    
   
   

    socket.on("message", function (message) {

         vm.messages.push(message);
         $scope.$apply(vm.messages);

    });
     
    function sub()
    {
        socket.emit("pm", {
            message: vm.message,
            id: vm.id
        });
    }
}
