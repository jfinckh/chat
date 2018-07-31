module namespace townsquare = 'http://basex.org/modules/web-page';
(: Import the Websocket-Module :)
import module namespace websocket = "http://basex.org/modules/Websocket";

(: If the Websocket is opened :)
declare
  %ws:connect("/")
  function townsquare:connect(
  )  {
      json:serialize(
        <json type="object">
          <type>Connect</type>
        </json>
    )
  };
 
 (: Helper Function for getting the Names of the Connected Users in the Room 
     @parm: $room the Room 
 :)
 declare function townsquare:getNames($room){
   for $uid in websocket:ids()
          where websocket:get($uid,"room") = $room
          return websocket:get($uid,"name")
 };
 
 (: If a Message is recieved:)
declare
  %ws:message("/","{$message}")
  function townsquare:message(
    $message as xs:string
  ){
    (: Parse the Json Message:)
    let $msg := parse-json($message)
    (: Get the Attributes Type, Name and Room from the Message:)
    let $type := map:get($msg, "type")
    let $name := map:get($msg, "name")
    let $room := map:get($msg, "room")
    (: Check what type the Message has:)
    return if ($type = "Ping") then (
      let $id := websocket:id()
      return json:serialize(
        <json type="object">
          <type>Pong</type>
        </json>)
    )else if ($type = "UpdatedName") then(
        let $id := websocket:id()
        let $set := websocket:set("name", $name) 
        let $setroom := websocket:set("room", $room) 
        return json:serialize(
          <json type="object">
            <type>UpdatedName</type>
            <id>{$id}</id>
            <room>{$room}</room>
          </json>
        )
      )
      else if ($type = "GetUsers") then(
        let $ids := websocket:ids()
        let $names := townsquare:getNames($room)

        let $id := websocket:id()
        let $resp := json:serialize(
                    <json type="object">
                      <type>GetUsers</type>
                      <id>{$id}</id>
                      <room>{$room}</room>
                      <names>{$names}</names>
                    </json>
                  )  
        return (websocket:emit($resp)) 
      )
      else (
        websocket:emit($message)
      )
  };
  
(: If the Connection gets Closed :)
declare 
  %ws:close("/")
  function townsquare:close(
  ){
    let $room := websocket:get("room")
    let $deleteRoom := websocket:delete("room")
    let $deleteName :=  websocket:delete("name")
    let $resp := json:serialize(
      <json type="object">
        <type>UpdatedName</type>
        <room>{$room}</room>
      </json>
    )
        return (websocket:broadcast($resp))
  }; 

(: If the Connection throws an Error :)
declare 
  %ws:error("/", "{$message}")
  function townsquare:error(
    $message as xs:string
  ){
    let $room := websocket:get("room")
    let $deleteRoom := websocket:delete("room")
    let $deleteName :=  websocket:delete("name") 
    let $resp := json:serialize(
      <json type="object">
        <type>UpdatedName</type>
        <room>{$room}</room>
      </json>
    )
        return (websocket:broadcast($resp))
  }; 