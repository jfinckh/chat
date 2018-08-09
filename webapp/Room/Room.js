app.controller("roomCtrl", function ($scope, $rootScope, $location, $window, wsservice) {
    /** Message types*/
    const TYPE_CONNECT_MSG = "Connect";
    const TYPE_ENTER_ROOM = "EnterRoom";
    const TYPE_LEAVE_ROOM = "LeaveRoom";
    const TYPE_MESSAGE = "Message";
    const TYPE_CHECK_IF_LOGGED_IN = "CheckIfLoggedIn";
    const TYPE_USERS_ROOM_UPDATED = "UserRoomUpdated";

    $scope.room = $location.path();
    $scope.chatmessage = "";
    $scope.users = [];
    $scope.messages = [];
    $scope.username = "";

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
     * If the User want to send a Message.
     * */
    $scope.sendMessage = function () {
        let d = new Date();
        let newMsg = {
            "type":     TYPE_MESSAGE,
            "name":     $scope.username,
            "room":     $scope.room,
            "time":     d.toLocaleTimeString(),
            "message":  $scope.chatmessage
        };
        wsservice.send(newMsg);
        // Reset the Inputfield
        $scope.chatmessage = "";
    };

    // If the Client recieves a Message, call this function
    function onMessage ( event ) {
        // Parse it as Json
        let jsonMsg = JSON.parse(event.data);

        switch(jsonMsg.type) {
            // If the websocket is just created it sends a connect. After that we want to ask for the username.
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
                $scope.username = jsonMsg.name;
                $scope.$apply();
                let enterroommsg = {
                    "type": TYPE_ENTER_ROOM,
                    "room": $scope.room
                };
                wsservice.send(enterroommsg);
                break;
            // If the users of the room were updated, set the names
            case TYPE_USERS_ROOM_UPDATED:
                if($scope.room !== jsonMsg.room) return;
                let names = jsonMsg.namesInRoom.split(' ');
                $scope.users = names;
                $scope.$apply();
                break;
            // If it is a message, push it to the messages.
            case TYPE_MESSAGE:
                if(jsonMsg.room !== $scope.room) return;
                $scope.messages.push(jsonMsg);
                $scope.$apply();
                break;
        }
    }

    // If the Page unloads. !!! This doesnt chatch the browser back-button!
    $window.onbeforeunload = function(event)
    {
        alert("onbevoreunload");
        let msg = {
            "type": TYPE_LEAVE_ROOM
        };
        wsservice.send(msg);
        wsservice.removeFromOnMessage(onMessage);
    };
});