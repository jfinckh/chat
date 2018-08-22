app.controller("roomCtrl", function ($scope, $rootScope, $location, $window, wsservice, $http) {
    /** Message types*/
    const TYPE_CONNECT_MSG = "Connect";
    const TYPE_ENTER_ROOM = "EnterRoom";
    const TYPE_LEAVE_ROOM = "LeaveRoom";
    const TYPE_MESSAGE = "Message";
    const TYPE_USERS_ROOM_UPDATED = "UserRoomUpdated";
    const TYPE_SET_WEBSOCKET_SESS_MSG = "SetWebsocketSess";

    $scope.room = $location.path();
    $scope.chatmessage = "";
    $scope.users = [];
    $scope.messages = [];
    $scope.username = "";

    // Send RestXq Request to check if the user is logged in
    let url = '/restxq/loginCheck';
    $http.get(url).then((result) => {
        let jsonMsg = result.data;
        //let jsonMsg = JSON.parse(result.data);
        if(jsonMsg.loggedIn !== "true"){
            $location.path("/");
        } else{
            $scope.username = jsonMsg.name;
            if(wsservice.websocketSet()){
                let enterroommsg = {
                    "type": TYPE_ENTER_ROOM,
                    "room": $scope.room
                };
                wsservice.send(enterroommsg);
            } else {
                wsservice.openWebsocket();
            }
            wsservice.addOnMessage(onMessage);
        }
    });
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
        console.log(event);
        let jsonMsg = JSON.parse(event.data);

        switch(jsonMsg.type) {
            // If the websocket is just created it sends a connect. After that we want to ask for the username.
            case TYPE_CONNECT_MSG:
                let setWebsocketSessMsg = {
                    "type": TYPE_SET_WEBSOCKET_SESS_MSG
                };
                wsservice.send(setWebsocketSessMsg);

                let enterroommsg = {
                    "type": TYPE_ENTER_ROOM,
                    "room": $scope.room
                };
                wsservice.send(enterroommsg);
                break;
            // If the users of the room were updated, set the names
            case TYPE_USERS_ROOM_UPDATED:
                let names = jsonMsg.namesInRoom.split(' ');
                $scope.users = names;
                $scope.$apply();
                break;
            // If it is a message, push it to the messages.
            case TYPE_MESSAGE:
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