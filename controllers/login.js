angular.module('myApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl',['$scope','$window','$timeout',function($scope,$window,$timeout) {
 

//function to authenticate user and redirect to home page
$scope.loginUser = function(){
	var email =  $scope.userEmail;
  	var password = $scope.userPassword;

	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
	  	$scope.errorMessage = true;
	    console.log("Login Failed!", error);

}).then(function(){
	$window.location.href = "/#/home"
});

}


 }]);