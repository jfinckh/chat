app.controller("loginCtrl", function ($scope, $rootScope, $window ,$location, $interval, wsservice) {
    // The Name of the User
    $scope.name = "";
    $scope.loggedIn = false;

    /** Message types*/
    const TYPE_CONNECT_MSG = "Connect";
    const TYPE_CHECK_IF_LOGGED_IN = "CheckIfLoggedIn";
    const TYPE_LOG_IN = "Login";
    const TYPE_LOG_OUT = "Logout";

    /** Message Objects*/

    /**
     * Check if the websocket is open or open it.
     * If it is open, check if we are logged in.
     * */
    if(wsservice.websocketSet()){
        let msg = {
            "type": TYPE_CHECK_IF_LOGGED_IN
        };
        wsservice.send(msg);
    } else {
        wsservice.openWebsocket();
    }
    wsservice.addOnMessage(onMessage);
    wsservice.addOnError(onError);

    /**
     * Enter the Chat.
     * Sets the Username in the Rootscope and switches to the chat
     * */
    $scope.enterChat = function () {
        $location.path("/lobby");
    };

    /**
     * Log Errors.
     * */
    function onError(event) {
        console.log(event);
    }

    /**
     * Function for checking what to do if a message from the server arrives.
     * */
    function onMessage (event) {
        // Parse it as Json
        let jsonMsg = JSON.parse(event.data);

        switch(jsonMsg.type) {
            case TYPE_CONNECT_MSG:
                let checklogmsg = {
                    "type": TYPE_CHECK_IF_LOGGED_IN
                };
                wsservice.send(checklogmsg);
                break;
            // If we are logged in, set the variables. If not: redirect to login page
            case TYPE_CHECK_IF_LOGGED_IN:
                if(jsonMsg.loggedIn === "false") {
                    return;
                }
                $scope.name = jsonMsg.name;
                $scope.loggedIn = true;
                $scope.$apply();
                break;
            default :
                break;
        }
    };

    /**
     * Login function.
     * */
    $scope.login = function() {
        let msg = {
            "type": TYPE_LOG_IN,
            "name": $scope.name
        };
        wsservice.send(msg);
    };

    /**
     * Log out function.
     * */
    $scope.logout = function() {
        let msg = {
            "type": TYPE_LOG_OUT
        };
        wsservice.send(msg);
    };

    $window.onbeforeunload = function(event)
    {
        wsservice.removeFromOnMessage(onMessage);
        wsservice.removeFromOnError(onError);
    };
});