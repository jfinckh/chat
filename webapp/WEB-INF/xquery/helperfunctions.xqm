module namespace helperfunctions = "helperfunctions";

(: Import the sessionmodule :)
import module namespace Sessions = "http://basex.org/modules/Sessions";

 (: Helperfunction for getting the names of the connected users in the room 
    @param: $room the Room 
 :)
 declare function helperfunctions:getNames($room){
   for $uid in Sessions:ids()
          where Sessions:get($uid,"room") = $room
          return Sessions:get($uid,"id")
 };
 
 (: Helperfunction for getting the ids of the connected users in the room
    @param: $room the Room
 :)
 declare function helperfunctions:getIds($room){
   for $uid in Sessions:ids()
          where Sessions:get($uid,"room") = $room
          return Sessions:get($uid,"websocket-id")
 };