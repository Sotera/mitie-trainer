define(['underscore-contrib'], function(_){

  return {
    'HOME' : _.partial(_.identity, "home"),
    'TRAIN' : function(id) { return "train/" + id; }
  };

});
