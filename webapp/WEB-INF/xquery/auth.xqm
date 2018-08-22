module namespace auth = 'http://basex.org/modules/web-page';
(: Import the messagesmodule :)
import module namespace messages = "messages" at "messages.xqm";

(: RestXq Endpoint: Check if the User is logged In :)
declare
  %rest:path('loginCheck')
  function auth:login-check(){
     messages:check-if-logged-in()
  };

(: RestXq Endpoint: Log in:)  
declare
  %rest:path('login/{$name}')
  function auth:login(
    $name as xs:string
  ){
    messages:login($name)
  };

(: RestXq Endpoint: Log Out :)
declare
  %rest:path('logout')
  function auth:logout(){
    messages:logout()
  };