app.controller("lobbyCtrl", function ($scope, $rootScope, $location) {

    // The Open Channels
    $scope.channels = [
        "TownSquare",
        "Work",
        "Kids",
        "Hobby",
        "Philosophikus"
    ];

    // The Username
    $scope.username = $rootScope.username;

    // If no Username is set, redirect to Login
    if(!$scope.username || $scope.username.length === 0) {
        $location.path("/");
    }
});