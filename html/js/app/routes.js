define(['underscore-contrib'], function(_){

  return {
    'HOME' : function(reload) { 
                    if (reload) return "home/reload"; 
                    return "home"; 
             },
    'TRAIN' : function(id) { return "train/" + id; },
    'TEST' : function(id) { 
                    if (id) return "test/" + id; 
                    return "test"; 
             }
  };

});
