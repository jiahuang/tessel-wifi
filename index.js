var cc3000 = require('wifi-cc3000');
var util = require('util');
var EventEmitter = require('events').EventEmitter;


function TesselWifi(opts){
  var self = this;
  self.opts = opts;
  self.MAX_DISCONNECT = self.opts.reconnect || 3;
  self.MAX_POWER_CYCLES = self.opts.powerCycle || 1;
  self.disconnectCount = 0;
  self.powerCycles = 0;
  self.MAX_WAIT = self.opts.wait || 30;
  self.MAX_ERRORS = self.opts.errors || 3;
  self.errorCount = 0;

  self.opts.DEBUG = false;

  // default power cycling to true
  self.opts.powerCycle = self.opts.powerCycle || true;

  if (TesselWifi.instance) {
    return TesselWifi.instance;
  }
  else {
    TesselWifi.instance = this;
  }

  cc3000.on('error', function(err){
    clearTimeout(self.kickWifiTimeout);

    // chain up errors that arent wifi busy
    if (cc3000.isBusy()) {
      if (self.errorCount >= self.MAX_ERRORS) {
        self.errorCount = 0;
        self._powerCycle();
      } else {
        self.errorCount++;
      }
    } else {
      self.emit('error', err);
    }
    
  });

  cc3000.on('disconnect', function(){
    clearTimeout(self._kickReset);
    clearTimeout(self.kickWifiTimeout);
    self._onDisconnect();
  });

  cc3000.on('timeout', function(){
    clearTimeout(self._kickReset);
    clearTimeout(self.kickWifiTimeout);
    // connection timed out, treat it the same way as a disconnect
    self._onDisconnect();

    // if we don't get a connected/disconnected event within another timeout cycle, reset the chip
    self._kickReset = setTimeout(self._powerCycle, self.MAX_WAIT*1000);
    
  });

  cc3000.on('connect', function(err, data){
    clearTimeout(self.kickWifiTimeout);

    self.emit('connect', err, data);
  });

  if (!cc3000.isConnected()) {
    cc3000.connect(self.opts);
  }

  self._onDisconnect = function(){
    if (self.disconnectCount >= self.MAX_DISCONNECT) {
      if (self.opts.powerCycle && self.powerCycles < self.MAX_POWER_CYCLES) {
        // try power cycling
        self._powerCycle();
      } else {
        // otherwise emit error
        self.emit('error', new Error("Cannot connect to "+cc3000.opts.ssid+" with password: "
          +cc3000.opts.password+" and "+cc3000.opts.security+" after "+self.disconnectCount+" retries and "
          +self.powerCycles+" power cycles"));
      }
    } else {
      if (self.opts.DEBUG) {
        console.log("Retrying connection");
      }
      // retry the connection
      self.disconnectCount++;
      cc3000.connect(self.opts);
    }
  }

  self._powerCycle = function(){
    cc3000.reset(function(){
      if (self.opts.DEBUG) {
        console.log("Power cycling");
      }

      self.powerCycles++;
      cc3000.connect(self.opts);
    });
  }

  self.reconnect = function(){
    cc3000.connect(self.opts);
  }

  // if there is no connect or disconnect after 30 seconds, attempt to connect
  self.kickWifiTimeout = setTimeout(function(){
    self._onDisconnect();
  }, self.MAX_WAIT*1000);

  return self;
}

util.inherits(TesselWifi, EventEmitter);

module.exports = TesselWifi;