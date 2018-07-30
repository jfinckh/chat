app.controller("loginCtrl", function ($scope, $rootScope, $location) {
    // The Name of the User
    $scope.name = "";

    /**
     * Enter the Chat.
     * Sets the Username in the Rootscope and switches to the chat
     * */
    $scope.enterChat = function () {
        $rootScope.username = $scope.name;
        $location.path("/lobby");
    };
});