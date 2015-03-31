define(['underscore-contrib', 'jquery', 'windows', 'ko', 'app/main-window', 'app/tag-types'], function(_, $, windows, ko, main_window, tag_types){

  var entityTypes = ko.observableArray(tag_types);
  
  //inject colors
  $("head").append($('<style>')
                   .html(
                     _.map(entityTypes(), function(o){
                       return "." + o.text + " { background-color: " + o.color + " } ";
                     }).join("\n")));

  var view = function(){
    var deferred = new $.Deferred();
    require(["text!templates/entity_view.html"], function(tmpl){
      deferred.resolve(tmpl);
    });
    return deferred.promise();
  };

  var render = function(container, model){
    container.empty();
    var ref = $('<div>').appendTo(container);
    var save = function(){
      //main_window.panelToggle();
      model.onSave(selectedType().text);
    };

    var close= function(){
      //main_window.panelToggle();      
    };

    var remove = function(){
      if (model.remove){
        model.remove();
      }
      close();
    };

    var selectedType = ko.observable({'text': 'Select ...', 'color' : '#fff' });

    if (model.current){
      var v = _.find(entityTypes(), function(o){ return o.text.localeCompare(model.current) == 0; });
      if (_.some(v)){
        selectedType(v);
      }
    }

    var setTypeSelected = function(sz){
      return function(e){
        selectedType(sz);
      };
    };

    var newColor = ko.observable('#fff');
    var newName = ko.observable();

    var addEntityType = function(){
      
      entityTypes.push({
        'text' : newName().slice(),
        'color': newColor().slice()
      });

      $("head").append($('<style>')
                       .html("." + newName() + " { background-color: " + newColor() + " } "));
    };
    var viewModel = {
      "entity": model.entity,
      "save" : save,
      "displayRemove" : ko.observable(_.some([model.remove])),
      "remove" : remove,
      "close": close,
      "entityTypes" : entityTypes,
      "selectedType" : selectedType,
      "setTypeSelected": setTypeSelected,
      "newName" : newName,
      "newColor" : newColor,
      "addEntityType" : addEntityType
    };

    view().done(function(tmpl){
      ref.html(tmpl);
      var cp = $('#cp').colorpicker({ format: 'hex' });
      cp.on('hide', function(ev){
        newColor(ev.color.toHex());
      })
      ko.applyBindings(viewModel, ref[0]);
    });
  };

  return { 
    render : render
  };

});
