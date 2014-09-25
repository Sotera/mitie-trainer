requirejs.config({
  baseUrl: 'js/',
  appDir: 'app/',
  paths: {
    'windows' : 'lib/windows',
    'msgpack': 'lib/msgpack',
    'text' : 'lib/text',
    'jquery' : 'lib/jquery-2.1.1.min',
    'bootstrap' : 'lib/bootstrap.min',
    'bootstrap.colorpicker' : 'lib/bootstrap-colorpicker',
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
    'bootstrap.colorpicker': {
      deps: ['bootstrap'],
      exports: '$.fn.colorpicker'
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

//prevent context menu
document.oncontextmenu = function(){ return false; };

requirejs(['underscore-contrib', 'crossroads', 'hasher', 'ko', 'app/main-window','app/routes', 'app/data', 'jquery', 'bootstrap'], function(_, crossroads, hasher, ko, main_window, routes, data, $){

  ko.applyBindings(main_window, $('body')[0]);

  var DEFAULT_HASH = routes.HOME();

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
    $('#widget-canvas').empty();
    var el = $('<div>').appendTo($('#widget-canvas'));
    require(['app/home-view'], function(home){
      home.render(el);
    });
  });

  crossroads.addRoute('/train/{id}', function(id){
    $('#widget-canvas').empty();
    var el = $('<div>')
      .appendTo($('#widget-canvas'));

    require(['app/markup'], function(markup){
      markup.render(el, id);
    });
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
