define(['underscore-contrib', 'ko', 'windows', 'app/main-window', 'app/routes', 'app/utils', 'app/data','app/tag-types', 'app/css', 'jquery','bootstrap', 'bootstrap.colorpicker'], function(_, ko, windows, main_window, routes, utils, data, tag_types, css, $){

  var view = function(){
    var deferred = new $.Deferred();
    require(['text!templates/admin_view.html'], function(tmpl){
      deferred.resolve(tmpl);
    });
    return deferred.promise();
  };

  var tagItem = function (text, color){
    var self = this;
    self.color = ko.observable(color);
    self.text = ko.observable(text);
    self.toJson = function() { return { 
      'text': self.text(), 
      'color': self.color() }; };
  };

  var tags = ko.observableArray(_.map(tag_types.getTags(), function(o){
    return new tagItem(o.text, o.color);
  }));

  var newColor = ko.observable('#fff');
  var newName = ko.observable('');

  var addEntityType = function(){
    tags.push(new tagItem(newName().slice().toLowerCase(), newColor().slice()));
    newName('');
    newColor('');
  };

  var render = function(el, i){

    view().then(function(tmpl){
      el.html(tmpl);
      var save = function(){
        tag_types.setTags(_.map(tags(), function(t){ return t.toJson(); }));
        tag_types.save();
        css.refreshRules();
        utils.navigate(routes.HOME());
      };

      var remove = function(item){
        return function(){
          tags.remove(function(t){
            return t.text() == item.text();
          })
          console.log('remove');
        };
      };

      ko.applyBindings({ 
        'tags' : tags,
        'save' : save,
        'remove' : remove,
        "newName" : newName,
        "newColor" : newColor,
        "addEntityType" : addEntityType
      }, el[0]);

      $('.cp').each(function(i, el){
        var cp = $(this).colorpicker({ format: 'hex' });
        cp.on('hide', function(ev){
          tags()[i].color(ev.color.toHex());
        });
      });

      var cp = $("#cp-edit").colorpicker({ format: 'hex' });  
      cp.on('hide', function(ev){
        newColor(ev.color.toHex());
      });
    });

    main_window.panelRef.empty();
    main_window.panelClose();
  };

  return {
    render : render
  };
})
