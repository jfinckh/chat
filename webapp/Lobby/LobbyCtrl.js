app.controller("lobbyCtrl", function ($scope, $rootScope, $location, wsservice, $window) {

    /** Message types*/
    const TYPE_CONNECT_MSG = "Connect";
    const TYPE_CHECK_IF_LOGGED_IN = "CheckIfLoggedIn";

    // The Open Channels
    $scope.channels = [
        "TownSquare",
        "Work",
        "Kids",
        "Hobby",
        "Philosophikus"
    ];
    $scope.name = "";

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

    /**
     * Check what to do if a message from the server arrives.
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
                    wsservice.closeWs();
                    $location.path("/");
                    return;
                }
                $scope.name = jsonMsg.name;
                $scope.$apply();
                break;
        }
    };

    $window.onbeforeunload = function(event)
    {
        wsservice.removeFromOnMessage(onMessage);
    };
});