angular.module("chat")
 		.config(routesData);

function routesData($routeProvider) {
	
	$routeProvider
	.when('/',{
        controller: 'ChatController',
        controllerAs: 'vm',
        templateUrl: '/chat.html'
    });

}