requirejs.config({
  baseUrl: 'js/',
  appDir: 'app/',
  paths: {
    'windows' : 'lib/windows',
    'msgpack': 'lib/msgpack',
    'text' : 'lib/text',
    'jquery' : 'lib/jquery-2.1.1.min',
    'bootstrap' : 'lib/bootstrap.min',
    'underscore': 'lib/underscore-min',
    'underscore-contrib' : 'lib/underscore-contrib.min',
    'ko' : 'lib/knockout-3.2.0.min',
    'd3' : 'lib/d3.min',
    'signals' : 'lib/signals.min',
    'crossroads' : 'lib/crossroads.min',
    'hasher' : 'lib/hasher.min'
  },
  shim: {
    'jquery': {
      exports: '$'
    },
    'bootstrap': {
      deps: ['jquery'],
      exports: '$.fn.popover'
    },
    'underscore': {
      exports: '_.map'
    },
    'underscore-contrib': {
      deps: ['underscore'],
      exports: '_'
    },
    'ko': {
      exports: 'ko'
    },
    'windows' : {
      deps : ['msgpack'],
      exports : 'windows'
    },    
    'hasher' : {
      deps: ['signals']
    }
  }
});


requirejs(['underscore-contrib', 'jquery', 'crossroads', 'hasher', 'ko'], function(_, $, crossroads, hasher, ko){

  var containerViewModel = (function(){
    var open = ko.observable(false);
    return {
      panelToggle : function(){
        open(!open());
      },
      cssBodyView : ko.pureComputed(function(){
        return open() ? "window-component panel-visible" : "window-component";
      })
    };
  }());

  ko.applyBindings(containerViewModel, $('body')[0]);

  var DEFAULT_HASH = 'home';

  function setHashSilently(hash){
    hasher.changed.active = false; //disable changed signal
    hasher.setHash(hash); //set hash without dispatching changed signal
    hasher.changed.active = true; //re-enable signal
  }

  function parseHash(newHash, oldHash){
    // second parameter of crossroads.parse() is the
    // "defaultArguments" and should be an array
    // so we ignore the "oldHash" argument to avoid issues.
    console.log('old: ' + oldHash + ', new: ' + newHash);
    crossroads.parse(newHash);
  }

  //setup crossroads
  crossroads.addRoute('/home', function(){

  });

  crossroads.routed.add(function(req, data){
    console.log('routed: ' + req);
    console.log(data.route +' - '+ data.params +' - '+ data.isFirst);
  });

  crossroads.bypassed.add(function(req){
    console.log('route not found: ' + req);
    alert('Error: route not found, go back');
  });

  //setup hasher
  //only required if you want to set a default value
  if(! hasher.getHash()) {
    hasher.setHash(DEFAULT_HASH);
  }
  
  hasher.initialized.add(parseHash); //parse initial hash
  hasher.changed.add(parseHash); //parse hash changes

  hasher.init(); //start listening for hash changes

});
