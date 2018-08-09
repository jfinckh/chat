app.factory("wsservice", function ($interval) {
    const websocketAdress = 'ws://localhost:80/ws';

    // Container for the Service Functions
    let service = {};
    // Variable for the websocket
    let ws = null;
    // Arrays for the websocket-functions. If an event occures, all assigned functions to that event will be
    // executed
    let onMessageFunctions = [];
    let onOpenFunctions = [];
    let onErrorFunctions = [];
    let onCloseFunctions = [];

    // Ping message
    const PING = {
        "type": "Ping"
    };

    /**
     * Function for sending a Ping Message every 8 seconds to prevent a timeout.
     * */
    function sendPing() {
        $interval(
            function(){
                service.send(PING);
            }
            , 8000);
    };
    // Add the pingmessage to the onopenfunctions
    onOpenFunctions.push(sendPing);

    /**
     * Returns true if websocket is set, false if not.
     * */
    service.websocketSet = () => {
        return ws !== null;
    };

    /**
     * Opens a WebsSocket if not opened yet.
     * */
    service.openWebsocket = function(){
        if(!service.websocketSet()) {
            ws = new WebSocket(websocketAdress);
            ws.onopen = (event) => onOpenFunctions.forEach((func) => func(event));
            ws.onclose = (event) => onCloseFunctions.forEach((func) => func(event));
            ws.onerror = (event) => onErrorFunctions.forEach((func) => func(event));
            ws.onmessage = (event) => onMessageFunctions.forEach((func) => func(event));
        }
    };

    /**
     * Sends Data over the WebSocket.
     * */
    service.send = function(stringMsg){
        if(ws === null) service.openWebsocket();
        else{
            ws.send(JSON.stringify(stringMsg));
        }
    };

    /**
     * Adds a Function to the onMessage-Callbacks.
     * */
    service.addOnMessage = (pFunc) => onMessageFunctions.push(pFunc);

    /**
     * Removes a Function from the onMessage-Callbacks.
     * */
    service.removeFromOnMessage = (pFunc) => {
        if(onMessageFunctions.length < 1) return;
        let index = onMessageFunctions.indexOf(pFunc);
        if(index > -1) onMessageFunctions.splice(index,1);
    };

    /**
     * Adds a Function to the onOpen-Callbacks.
     * */
    service.addOnOpen = (pFunc) => onOpenFunctions.push(pFunc);

    /**
     * Removes a Function from the onOpen-callbacks.
     * */
    service.removeFromOnOpen = (pFunc) => {
        if(onOpenFunctions.length < 1) return;
        let index = onOpenFunctions.indexof(pFunc);
        if(index > -1) onOpenFunctions.splice(index,1);
    };

    /**
     * Adds a Function to the onClose-Callbacks.
     * */
    service.addOnClose = (pFunc) => onCloseFunctions.push(pFunc);

    /**
     * Removes a Function from the onClose-callbacks.
     * */
    service.removeFromOnClose = (pFunc) => {
        if(onCloseFunctions.length < 1) return;
        let index = onCloseFunctions.indexof(pFunc);
        if(index > -1) onCloseFunctions.splice(index,1);
    };
    /**
     * Adds a function to the onError-Callbacks.
     * */
    service.addOnError = (pFunc) => onErrorFunctions.push(pFunc);

    /**
     * Removes a Function from the onClose-callbacks.
     * */
    service.removeFromOnError = (pFunc) => {
        if(onErrorFunctions.length < 1) return;
        let index = onErrorFunctions.indexof(pFunc);
        if(index > -1) onErrorFunctions.splice(index,1);
    };

    /**
     * Closes the WebSocket.
     * */
    service.closeWs = () => {
      ws.close();
      onErrorFunctions = [];
      onCloseFunctions = [];
      onOpenFunctions = [];
      onMessageFunctions = [];
      ws = null;
    };

    return service;
});