define(['underscore-contrib', 'windows', 'hasher', 'jquery'], function(_, windows, hasher, $){


  var navigate = function(url){
    //pre navigate logic
    hasher.setHash(url);
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
    isElementInViewport: isElementInViewport, 
  };
});
