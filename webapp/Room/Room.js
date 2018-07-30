app.controller("roomCtrl", function ($scope, $rootScope, $location, $interval) {
    var ws;
    $scope.username = $rootScope.username;
    $scope.room = $location.path();
    // IF no Username set, go to login
    if(!$scope.username || $scope.username.length === 0) {
        $location.path("/");
    }
    $scope.chatmessage = "";
    $scope.users = [];
    $scope.messages = [];

    /**
     * If the User want to send a Message.
     * */
    $scope.sendMessage = function () {
        var d = new Date();
        var newMsg = {
            "type":     "Message",
            "name":     $scope.username,
            "room":     $scope.room,
            "time":     d.toLocaleTimeString(),
            "message":  $scope.chatmessage
        };
        ws.send(JSON.stringify(newMsg));
        // Reset the Inputfield
        $scope.chatmessage = "";
    };

    // If the Client recieves a Message, call this function
    function onMessage ( event ) {
        // Parse it as Json
        var jsonMsg = JSON.parse(event.data);
        console.log(jsonMsg);
        // Response "Pong" to "Ping"
        if(jsonMsg.type === "Ping") {
            var msg = {
                "type" : "Pong"
            };
            ws.send(JSON.stringify(msg));
        }

        // If it is a Connect Message, send a updateusername message
        if(jsonMsg.type === "Connect"){
            var connectMsg = {
                "type":     "UpdatedName",
                "name":     $scope.username,
                "room":     $scope.room,
                "userid" :     jsonMsg.id
            };
            ws.send(JSON.stringify(connectMsg));
        }

        // If the Message is for another Room
        if(jsonMsg.room !== $scope.room) {
            return;
        }

        // If the Message is a plain message, add it to the messages array
        if(jsonMsg.type === "Message"){
            $scope.messages.push(jsonMsg);
            $scope.$apply();
        }

        // If it is a UpdatedName Message, add the User to the users array
        if(jsonMsg.type === "UpdatedName"){
            console.log("Send Get Users");
            var msg = {
                "type": "GetUsers",
                "room": $scope.room,
                "name": $scope.username
            };
            ws.send(JSON.stringify(msg));
            $scope.$apply();
        }
        if(jsonMsg.type === "GetUsers") {
            var names = jsonMsg.names.split(' ');
            $scope.users = names;
            $scope.$apply();
        }
        if(jsonMsg.type === "Disconnect") {
            alert("so disconnected");
        }
    }

    // Connect to the Websocket
    $scope.connectWebsocket = function () {
        // Open a Websocket
        var websocketAdress = 'ws://localhost:80/ws';
        ws = new WebSocket(websocketAdress);

        ws.onopen = function (event) {
            // Send a "Ping" every 8secs to prevent a timeout
            $interval(
                function(){
                                var msg = {
                                    "type": "Ping"
                                };
                                ws.send(JSON.stringify(msg));
                            }
            , 8000);
        };

        // Check what to do if a Message arrives
        ws.onmessage = function (event) {
            onMessage(event);
        };
    };
    $scope.connectWebsocket();
});