define(['underscore-contrib', 'jquery'], function(_, $){

  var data = [];

  var tokenize = function(sz){
    return sz.split(' ');
  };

  var addSample = function(sz){
    var s = sz.slice();
    
    data.push({
      'text' : s,
      'tokens': tokenize(s),
      'tags' : []
    });
  };

  var addTag = function(i, start, end, tag){
    data[i].tags.push({
      'start': start, 
      'end': end,
      'tag': tag
    });
  };

  var clearTags = function(i){
    data[i].tags = [];
  };

  var removeTag = function(i, start, end){
    data[i].tags = _.filter(data[i].tags, 
                            function(t){
                              return _.any([t.start != start, t.end != end]);
                            });
  };

  var trainings = function(){
    return data;
  };

  var bulkload = function(j){
    data = j.slice(0);
  };

  var load = function(){
    var deferred = new $.Deferred();
    $.get('data/all', function(resp){
      data = resp.data;
      deferred.resolve(data);
    });
    return deferred.promise();
  };


  return {
    addSample : addSample,
    addTag : addTag,
    clearTags : clearTags,
    removeTag : removeTag,
    trainings : trainings,
    init : load,
    bulkload : bulkload
  }
});
