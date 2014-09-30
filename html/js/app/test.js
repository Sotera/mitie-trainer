define(['underscore-contrib', 'windows', 'hasher', 'ko', 'app/utils', 'app/routes', 'app/data','jquery'], function(_, windows, hasher, ko, utils, routes, data, $){

  var view = function(){
    var deferred = new $.Deferred();
    require(['text!templates/test_view.html'], function(tmpl){
      deferred.resolve(tmpl);
    });
    return deferred.promise();
  };

  var sample_text = ko.observable("");
  var results = ko.observableArray([]);
  var tokens = ko.observableArray([]);

  var test_handler = function(){
    var post_data = JSON.stringify({ sample: sample_text() });
    $.ajax({
      url:'train/test',
      type:"POST",
      data:post_data,
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    })
      .done(function(resp){
        tokens(resp.tokens);
        results(resp.results);
      })
      .fail(function(){
        results($('<O_o>').append(
          $('<span>').addClass("glyphicon").addClass("glyphicon-remove-sign"), 
          $('<span>').html("  failed to execute test")))
      });
  };

  var home_handler = function(){
    utils.navigate(routes.HOME());
  };

  var highlightTokens = function(o){
    return function(e){
      _.each(o.indices, function(i){
        $('.idx_' + i).addClass('highlight');
      });
      var el = $('.idx_' + _.first(o.indices));
      var container = $(".text_tokens").first();
      container.animate({
        scrollTop: el.offset().top - container.offset().top + container.scrollTop()
      });
    };
  };

  var unhighlightTokens = function(o){
    return function(e){
      _.each(o.indices, function(i){
        $('.idx_' + i).removeClass('highlight');
      });
    };
  };

  var render = function(el, id){
    view().then(function(tmpl){
      el.html(tmpl);
      results = ko.observableArray([]);
      tokens = ko.observableArray([]);

      if (id) sample_text(data.trainings()[id].text)

      ko.applyBindings({ 
        'text_results' : results, 
        'tokens': tokens,  
        'sample_text': sample_text, 
        'home_handler' : home_handler, 
        'test_handler' : test_handler,
        'highlightTokens' : highlightTokens,
        'unhighlightTokens' : unhighlightTokens, 
        'theClass' : function(i){ return "class_" + i; } 
      }, el[0]);
    });
  };


  return {
    render : render
  };

})

