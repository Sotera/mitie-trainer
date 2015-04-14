define(['underscore-contrib', 'windows', 'hasher', 'jquery'], function(_, windows, hasher, $){


  var navigate = function(url){
    //pre navigate logic
    hasher.setHash(url);
  };

  var findIndex = function(list, pred){
    var l = list.length;
    var i = 0;
    for (;i<l;i++){
      if (pred(list[i])){
        return i;
      }
    }
    return -1;
  };

  var strEndsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var autosave_interval = _.once(function(data){
    var autosaves = function(){
      if (data.trainings().length > 0){
        $.ajax({
          url:'data/auto_save',
          type:"POST",
          data:JSON.stringify({'filename': data.fileName(), 'trainings' : data.trainings() }),
          contentType:"application/json; charset=utf-8",
          dataType:"json"
        }).done(function(resp){
          console.log('auto saved ' + resp.saved);
        });
      }
    };
    //3 min
    setInterval(autosaves, 60 * 1000);
  });

  var current_route_array = function(){
    return hasher.getHashAsArray();
  };
  
  var isElementInViewport = function(el, container) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $(window).height() &&
        rect.right <= $(window).width());
  };

  return {
    findIndex : findIndex,
    strEndsWith : strEndsWith,
    navigate : navigate,
    current_route_array : current_route_array,
    autosave_interval : autosave_interval,
    isElementInViewport: isElementInViewport, 
  };
});
