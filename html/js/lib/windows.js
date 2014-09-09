;;
this.windows || (function(scope){

  var windows = scope.windows = (function(){

    var _subscriptions = {};
    var prepend = "channel.";

    var storage_changed_event = function(storageEvent){
      var key = storageEvent.key;
      var oldValue = storageEvent.oldValue;
      var newValue = storageEvent.newValue;
      var url = storageEvent.url;
      var time = storageEvent.timeStamp;

      //add pattern matching for subscriptions
      if (_subscriptions[key] != null){
        if (newValue != null){
          var val = msgpack.unpack(JSON.parse(newValue));
          _subscriptions[key](val.data, storageEvent);
        }
      }
    };

    window.addEventListener('storage', storage_changed_event, false);

    var subscribe = function(channel, handler){
      delete _subscriptions[prepend + channel];
      _subscriptions[prepend + channel] = handler;
    };

    var unsubscribe = function(channel){
      delete _subscriptions[prepend + channel];
    };

    var publish = function(channel, data){
      var val = msgpack.pack({ data: data, time: new Date().getTime() });
      //fires channel changed event
      localStorage.setItem(prepend + channel, JSON.stringify(val));
      //removes data from storage to preserve space 
      //event suppressed when newValue is null
      localStorage.removeItem(prepend + channel);
    };

    var subscriptions = function(){
      return Object.keys(_subscriptions);
    };

    return {
      publish : publish,
      subscribe : subscribe,
      subscriptions : subscriptions,
      unsubscribe : unsubscribe
    };

  }());
}(this));
