define(['underscore-contrib', 'windows', 'hasher', 'jquery'], function(_, windows, hasher, $){


  var navigate = function(url){
    //pre navigate logic
    hasher.setHash(url);
  };

  return {
    navigate : navigate
  };
});
