#Tessel wifi

This is a wrapper lib around the `wifi-cc3000` lib that Tessel provides.

This lib aggressively tries to connect and will power cycle the wifi chip if it still doesn't connect.

##Usage

```js
var tesselWifi = require('tessel-wifi');

var options = {
  ssid: 'network',
  password: 'abc123',
  // security: wpa2, // optional, defaults to wpa2
  // timeout: 20, // optional timeout to connect to a network. defaults to 20
  // reconnect: 3, // optional number of times to try to auto reconnect on a disconnect event. defaults to 3
}

var wifi = new tesselWifi(options);

wifi.on('connect', function(err, data){
    //this event gets called whenever we connect or reconnect
    console.log("Connected to", options.ssid);
  })
  .on('disconnect', function(err, data){
    // pause the program here, wait until we reconnect
    console.log("WARN: No longer connected to", options.ssid);
  })
  .on('error', function(err){
    console.log("ERROR:", err);

    wifi.reconnect();
  });

``` 

##Details

Here's what this lib attempts to do:

1. Tries to connect to wifi as soon as its initialized
2. Sets a timeout of 30 seconds to try to reconnect if wifi doesn't connect
3. At every disconnect/timeout event, auto attempts to reconnect. If there's 3 disconnect/timeout events in a row, will power cycle the chip & attempt a reconnect.
4. After 3 error events will power cycle and attempt a reconnect.
