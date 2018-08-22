app.controller("lobbyCtrl", function ($scope, $rootScope, $location, $http) {
    // The Open Channels
    $scope.channels = [
        "TownSquare",
        "Work",
        "Kids",
        "Hobby",
        "Philosophikus"
    ];
    $scope.name = "";

    // Send RestXq Request to check if the user is logged in
    let url = '/restxq/loginCheck';
    $http.get(url).then((result) => {
        let jsonMsg = result.data;
        //let jsonMsg = JSON.parse(result.data);
        if(jsonMsg.loggedIn !== "true"){
            $location.path("/");
        } else{
            $scope.name = jsonMsg.name;
        }
    });
});