app.controller("loginCtrl", function ($scope, $rootScope, $window ,$location, $interval, $http) {
    // The Name of the User
    $scope.name = "";
    $scope.loggedIn = false;

    // Send RestXq Request to check if the user is logged in
    let url = '/restxq/loginCheck';
    $http.get(url).then((result) => {
        let jsonMsg = result.data;
        //let jsonMsg = JSON.parse(result.data);
        if(jsonMsg.loggedIn !== "true"){
            $location.path("/");
        } else{
            $scope.name = jsonMsg.name;
            $scope.loggedIn = true;
        }
    });

    /**
     * Enter the Chat.
     * Sets the Username in the Rootscope and switches to the chat
     * */
    $scope.enterChat = function () {
        $location.path("/lobby");
    };

    /**
     * Login function.
     * */
    $scope.login = function() {
        let url = '/restxq/login/' + $scope.name;
        $http.get(url).then((result) => {
            let jsonMsg = result.data;
            //let jsonMsg = JSON.parse(result.data);
            if(jsonMsg.loggedIn !== "true"){
                $location.path("/");
            } else{
                $scope.name = jsonMsg.name;
                $scope.loggedIn = true;
            }
        });
    };

    /**
     * Log out function.
     * */
    $scope.logout = function() {
        let url = '/restxq/logout';
        $http.get(url).then((result) => {
            let jsonMsg = result.data;
            //let jsonMsg = JSON.parse(result.data);
            if(jsonMsg.loggedIn === "false"){
                $scope.name = "";
                $scope.loggedIn = false;
            }
        });
    };
});