define(['underscore-contrib', 'jquery', 'windows', 'ko'], function(_, $, windows, ko){

  var open = ko.observable(false);

  return {
    panelToggle : function(){
      open(!open());
    },
    panelOpen: function(){
      open(true);
    },
    panelClose: function(){
      open(false);
    },
    panelIsOpen: open,
    panelRef: $(".right-panel").first(),
    cssBodyView : ko.pureComputed(function(){
      return open() ? "window-component panel-visible" : "window-component";
    })
  };

});
