var app = angular.module("chatExample", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl :   "Login/login.html",
            controller  :   "loginCtrl"
        })
        .when("/lobby", {
            templateUrl :   "Lobby/Lobby.html",
            controller  :   "lobbyCtrl"
        })
        .when("/TownSquare", {
            templateUrl : "Room/Room.html",
            controller  : "roomCtrl"
        })
        .when("/Work", {
            templateUrl : "Room/Room.html",
            controller  : "roomCtrl"
        })
        .when("/Kids", {
            templateUrl : "Room/Room.html",
            controller  : "roomCtrl"
        })
        .when("/Hobby", {
            templateUrl : "Room/Room.html",
            controller  : "roomCtrl"
        })
        .when("/Philosophikus", {
            templateUrl : "Room/Room.html",
            controller  : "roomCtrl"
        });
});