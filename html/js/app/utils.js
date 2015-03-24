define(['underscore-contrib', 'windows', 'hasher', 'jquery'], function(_, windows, hasher, $){


  var navigate = function(url){
    //pre navigate logic
    hasher.setHash(url);
  };

  var autosave = function(trainings){
    return $.ajax({
      url:'data/auto_save',
      type:"POST",
      data:JSON.stringify({ 'trainings' : trainings }),
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    });
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
    navigate : navigate,
    autosave : autosave,
    isElementInViewport: isElementInViewport, 
  };
});
