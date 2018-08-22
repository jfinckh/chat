module namespace chat = 'http://basex.org/modules/web-page';
(: Import the Websocketsmodules :)
import module namespace websocket = "http://basex.org/modules/Websocket";
(: Import the messagesmodule :)
import module namespace messages = "messages" at "messages.xqm";
(: Import the helperfunctionsmodule :)
import module namespace helperfunctions = "helperfunctions" at "helperfunctions.xqm";

 (: If the WebSocket is opened :)
declare
  %ws:connect("/")
  function chat:connect(
  )  {
     messages:connect()
  };
  
 (: If a message is recieved:)
declare
  %ws:message("/","{$message}")
  function chat:message(
    $message as xs:string
  ){
    (: Parse the json message:)
    let $msg := parse-json($message)
    (: Get the attributes: type, name, room from the message:)
    let $type := map:get($msg, "type")
    let $name := map:get($msg, "name")
    let $room := map:get($msg, "room")
    (: Check what type the message has:)
    return if ($type = "Ping") then (
      messages:ping()
    )
    (: Set the WebsocketSession to the Session :)
    (: If the user opens two tabs, the newest one will be updated :)
    else if($type = "SetWebsocketSess") then(
      messages:set-websocket-sess()
    )
    (: If the user joins a room:)
    else if ($type = "EnterRoom") then(
      messages:enter-room($room)
    )
    (: If the user leaves the room, check how many instances are open :)
    else if ($type = "LeaveRoom") then(
      messages:leave-room()
    )
    (: If it is a normal message: :)
    else if ($type = "Message") then (
      messages:message($room, $message)
    )
    (: in all other cases emit it to all connected users:)
    else (
      websocket:emit($message)
    )
  };
  
(: If the connection gets closed :)
declare 
  %ws:close("/")
  function chat:close(
  ){
      messages:leave-room()
  }; 

(: If the connection throws an error :)
declare 
  %ws:error("/", "{$message}")
  function chat:error(
    $message as xs:string
  ){
     messages:error()
  }; 