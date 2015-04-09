define(['underscore-contrib', 'ko', 'windows', 'app/main-window', 'app/routes', 'app/utils', 'app/entity-view', 'app/data','app/tag-types', 'jquery','bootstrap', 'bootstrap.colorpicker'], function(_, ko, windows, main_window, routes, utils, entity_view, data, tag_types, $){

  var current_training = null;

  var view = function(){
    var deferred = new $.Deferred();
    require(['text!templates/markup_view.html'], function(tmpl){
      deferred.resolve(tmpl);
    });
    return deferred.promise();
  };

  var getTags = function(){
    var tagged = _.map($('.markup-container').find('.tag'), function(tag){
      var t = $(tag).attr('class').replace('tag', '').trim();
      var start = +$(tag).children().first().attr('data-index');
      var end = +$(tag).children().last().attr('data-index') + 1;
      return [start, end, t];
    });
    return tagged;
  };

  var save = function(){
    console.log(current_training);
    data.clearTags(current_training);
    var addTag = _.partial(data.addTag, current_training);
    _.each(getTags(), function(t){
      addTag(t[0], t[1], t[2]);
    });
  };


  var render = function(el, i){

    current_training = i;

    view().then(function(tmpl){
      el.html(tmpl);
      var container = el.find(".markup-container").first();

      container.append(
        _.map(data.trainings()[i].tokens,
              function(part, i){ 
                return $('<span>').html(_.first(part)).attr("data-index", i);
              }));

      var navigate_home = _.partial(utils.navigate, routes.HOME())
      var navigate_next = function (){
        var i = _.last(utils.current_route_array());
        if (_.isNumeric(i) && 
            (+i < data.trainings().length - 1)){
          utils.navigate(routes.TRAIN(+i + 1));
        };
      };

      var navigate_prev = function (){
        var i = _.last(utils.current_route_array());
        if (_.isNumeric(i) && 
            (+i > 0)){
          utils.navigate(routes.TRAIN(+i - 1));
        };
      };

      var entity_types = ko.observableArray(tag_types.getTags());
      var currentType = ko.observable(_.first(tag_types.getTags()));
      var setSelectedType = function(type){
        return function(){
          console.log(type)
          currentType(type);
        };
      };

      var selectedFn = function(type){
        return ko.computed(function(){
          console.log(type.text);
          if (currentType()){
            console.log(currentType().text.localeCompare(type.text) == 0);
            if (currentType().text.localeCompare(type.text) == 0){
              return type.color;
            }
          }
          $(".markup-container").focus();
          return "";          
        });
      };

      var auto_tag_builder = function(div, type){
        div.find('span').each(function(i, el){
          $(this).off("click");
        });
        div.removeClass().addClass("tag").addClass(type)
        div.on("click", function(){
          if(!$(this).hasClass("highlight")){
            var currentHighlight = $('.markup-container').find('div.highlight').first();
            if (currentHighlight.hasClass("tag")){
              currentHighlight.removeClass("highlight")
            } else {
              currentHighlight.find('span').first().unwrap();                
            }
            $(this).addClass("highlight");
          } else {
            $(this).removeClass("highlight");
          }
        });
      };

      var tag_highlight = function(){
        var highlight = $('.markup-container').find('div.highlight').first();
        //there is a highlight and it is not a tag
        if (_.some(highlight) && !highlight.hasClass("tag")){
          auto_tag_builder(highlight, currentType().text);
          save();
        }
      };

      var untag_highlight = function(){
        var highlight = $('.markup-container').find('div.highlight').first();
        if (highlight.hasClass("tag")){
          highlight.find('span').each(function(i, el){
            $(this).on("click", function(){
              handle_highlight($(this));
            });
          });
        }
        highlight.find('span').first().unwrap();
        save();
      };

      var checkKey = function(data, evt){
        var key_code = evt.keyCode;

        if (key_code == 37 || key_code == 39){
          var btns = $(".btn-group").find('button');

          var idx = utils.findIndex(btns, function(btn){
            return $(btn).attr("data-type") == currentType().text;
          });
          
          //left
          if (key_code == 37){
            if (idx == 0){
              idx = btns.length -1;
            } else {
              idx = idx - 1;
            }
          }
          //right
          if (key_code == 39){
            if (idx == btns.length -1){
              idx = 0;
            } else {
              idx = idx +1;
            }
          }
          var tag = _.find(tag_types.getTags(), function(t) {
            return t.text == $(btns[idx]).attr('data-type');
          });
          currentType(tag);
        }

        if (key_code == 84){
          tag_highlight();
        }

        if (key_code == 85){
          untag_highlight();
        }
      };

      var highlightBuilder = function(el){
        var div = $('<div>').addClass("highlight");
        $(el).wrap(div);
      };

      var handle_highlight = function(span){
        var right = span.nextAll().first();
        var left = span.prevAll().first(); 
        var currentHighlight = $(".markup-container").find("div.highlight").first();

        //there is no currentHighlight
        //and this span is not tagged
        if (_.not(_.some(currentHighlight)) 
            && _.not(span.parent().hasClass("tag"))){
          highlightBuilder(span);
          return;
        }

        if ($(span).parent().hasClass("highlight")){
          //remove highlighting if only 1 word is highlighted
          if (_.every([_.not(left.is("span")), _.not(right.is("span"))])){
            $(span).unwrap();
            return;
          }
          
          //this is the middle of a highlight
          //cannot unhighlight tokens from the middle 
          if (_.every([left.is("span"), right.is("span")])){
            return;
          }

          // remove from end
          if (_.every([left.is("span"), _.not(right.is("span"))])){
            $(span).detach().insertAfter(currentHighlight);
            return;
          }

          // remove from begining 
          if (_.every([_.not(left.is("span")), right.is("span")])){
            $(span).detach().insertBefore(currentHighlight);
            return;
          }
        }

        if (right.is(currentHighlight)){
          if (!currentHighlight.hasClass("tag")){
            span.detach().prependTo(currentHighlight);
          }
          return;
        }

        if (left.is(currentHighlight)){
          if (!currentHighlight.hasClass("tag")){
            span.detach().appendTo(currentHighlight);
          }
          return;
        }

        //highlight is somewhere else remove it and move the highlight
        //to the current location
        if (currentHighlight.hasClass("tag")){
          currentHighlight.removeClass("highlight");
        } else {
          currentHighlight.find('span').first().unwrap();
        }
        highlightBuilder(span);        

      };

      ko.applyBindings({ 
        'entity_types' : entity_types,
        'selectedType' : setSelectedType,
        'checkKey' : checkKey,
        'currentType': currentType,
        'selectedFn' : selectedFn,
        'navigate_prev' : navigate_prev, 
        'navigate_home': navigate_home, 
        'navigate_next' : navigate_next }, el[0]);

      
      $(".markup-container").first().find('span').each(function(i, span){
        $(this).on('click', function(){
          handle_highlight($(this));
        });
      });
      
      _.each(data.trainings()[i].tags, function(tag){
        var spans = _.filter(el.find('span'), function(e){
          var i = parseInt($(e).attr('data-index'));
          return _.every(
            [_.gte(i, tag.start), 
             _.lt(i, tag.end)]);
        });
        
        var div = $('<div>');
        $(spans).wrapAll(div);

        var p = $(spans).parent();
        _.defer(function(){
          auto_tag_builder(p, tag.tag);
        });
      })
      
    });

    main_window.panelRef.empty();
    main_window.panelClose();
  };

  return {
    render : render
  };
});
