var tessel = require('tessel');

var tesselWifi = require('..');

var options = {
  ssid: 'network',
  password: 'abc123',
  // security: wpa2, // optional, defaults to wpa2
  // timeout: 20, // optional timeout to connect to a network. defaults to 20
  // reconnect: 3, // optional number of times to try to auto reconnect on a disconnect event. defaults to 3
  // powerCycle: true, // optional try to power cycle if we're still not connected after we've gone through all reconnect attempts
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

