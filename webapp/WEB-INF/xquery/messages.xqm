module namespace messages = 'messages';
(: Import the websocket/s-modules:)
import module namespace websocket = "http://basex.org/modules/Websocket";
(: Import the session/s-modules :)
import module namespace Session = "http://basex.org/modules/Session";
import module namespace Sessions = "http://basex.org/modules/Sessions";
(: Import the helperfunctions:)
import module namespace helperfunctions = "helperfunctions" at "helperfunctions.xqm";

(: Function for sending a connect frame if the connection is opened :)
declare function messages:connect(){
 json:serialize(
                <json type="object">
                  <type>Connect</type>
                </json>  
              )
};

(: Function for responding with a pong-message to a ping-message :)
declare function messages:ping() {
  let $resp := json:serialize(
                              <json type="object">
                                <type>Pong</type>
                              </json>
                            )
  return websocket:send($resp,websocket:id())
};

(: Function for responding to a CheckIfLoggedIn message.
   Checks if a name is set in the session (in this application this means 
   the client is logged in) and sends a flag if logged in with the (empty?) 
   clientname to the caller :)
declare function messages:check-if-logged-in(){
   let $client-name := Session:get("name")
   let $logged-in := (not(empty($client-name)))
   let $resp := json:serialize(
                                 <json type="object">
                                   <type>CheckIfLoggedIn</type>
                                   <name>{$client-name}</name>
                                   <loggedIn>{$logged-in}</loggedIn>
                                 </json>
                               )
   return websocket:send($resp,websocket:id())
};

(: Client login. Sets the clientname in the session and response with a 
   CheckIfLoggedIn message. :)
declare function messages:login($name){
  let $client-name := Session:set("name", $name)
  let $resp := json:serialize(
                                <json type="object">
                                  <type>CheckIfLoggedIn</type>
                                  <name>{ $name }</name>
                                  <loggedIn>true</loggedIn>
                                </json>
                              )
  return $resp
};

(: Function for processing EnterRoom Messages. Checks if the last Room was empty
   then joins the room. If the last room was the same room, increase counter.
   That means that more then one tabs are open. If the user closes one tab we dont
   want to throw the user out of our room, just the one tab. :)
declare function messages:enter-room($room){
  let $prev-room := Session:get("room")
  let $new-counter := 
  (: If the last room of the user is empty :)
  if (empty($prev-room)) then (
    let $set-room := Session:set("room", $room)
    return Session:set("count", 1)
  ) 
  (: if the user opens f.e. a new tab with the same room :)
  else if ($prev-room = $room) then(
    let $log2 := Session:get("count")
    return Session:set("count", Session:get("count") + 1)
  ) 
  (: if the user opens f.e. a new tab with another room :)
  else (
    (: should break connection, open more sessions, or sth else:)
  )
  let $names-in-room := helperfunctions:getNames($room)
  let $resp := json:serialize(
                                <json type="object">
                                  <type>UserRoomUpdated</type>
                                  <room>{$room}</room>
                                  <namesInRoom>{$names-in-room}</namesInRoom>
                                </json>
                              )
  return websocket:emit($resp)   
};

(: Function for leaving the room, checks how many tabs are open :)
declare function messages:leave-room(){
  let $tabs-open := Session:get("count")
  let $prev-room := Session:get("room")
  
  let $new-count := 
    if ($tabs-open > 1 ) then (
      Session:set("count",Session:get("count")-1)
    ) else(
      let $del-room := Session:delete("room")
      return Session:set("count",0)
    )  
  let $names-in-room := helperfunctions:getNames($prev-room)
  let $resp := json:serialize(
                                <json type="object">
                                  <type>UserRoomUpdated</type>
                                  <room>{$prev-room}</room>
                                  <namesInRoom>{$names-in-room}</namesInRoom>
                                </json>
                              )       
  (: Use emit here because if the user has more than one tabs open he 
  wants to get informed in all tabs :) 
  return websocket:emit($resp)
};

(: If an error occured, remove the client from the room and update the other
   clients :)
declare function messages:error(){
  let $room := Session:get("room")
  let $deleteRoom := Session:delete("room")
  let $deleteName :=  Session:delete("name") 
  let $names-in-room := helperfunctions:getNames($room)
  let $resp := json:serialize(
                              <json type="object">
                                <type>UserRoomUpdated</type>
                                <room>{$room}</room>
                                <namesInRoom>{$names-in-room}</namesInRoom>
                              </json>
                              )
    return (websocket:emit($resp))
};