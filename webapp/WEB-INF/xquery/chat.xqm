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
    (: Get the attributes: type, namem, room from the message:)
    let $type := map:get($msg, "type")
    let $name := map:get($msg, "name")
    let $room := map:get($msg, "room")
    (: Check what type the message has:)
    return if ($type = "Ping") then (
      messages:ping()
    )
    (: Check if the client is already logged in :)
    else if( $type = "CheckIfLoggedIn") then (
      messages:check-if-logged-in()
    )
    (: Log In :)
    else if ($type = "Login") then(
      messages:login($name)
    )
    (: If the user joins a room:)
    else if ($type = "EnterRoom") then(
      messages:enter-room($room)
    )
    (: If the user leaves the room, check how many instances are open :)
    else if ($type = "LeaveRoom") then(
      messages:leave-room()
    )
    (: in all other cases (f.e. normal message) emit it to all connected users:)
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