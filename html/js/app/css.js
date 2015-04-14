define(['underscore-contrib', 'app/tag-types', 'app/utils', 'jquery'], function(_, tag_types, utils, $){

  var sheet = _.find(document.styleSheets, function(sheet){
    return sheet.ownerNode.id == 'custom-style';
  });

  var getRules = function(){
    var o = _.object(_.map(sheet.cssRules, function(rule){
      return [rule.selectorText, rule];
    }));
    return o;
  };

  var hasRule = function(selector){
    return _.has(getRules(), selector);
  };

  var getRule = function(selector){
    return getRules()[selector];
  };

  var deleteRule = function(selector){
    var idx = utils.findIndex(sheet.cssRules, function(rule){
      return rule.selectorTest == selector;
    });
    if (idx > 0){
      sheet.deleteRule(idx);
    }
  };

  var refreshRules = function(){
    var types = tag_types.getTags();
    for(;sheet.cssRules.length > 0;){
      sheet.deleteRule(0);
    }
    types.forEach(function(t){
      setRule("." + t.text, t.color);
    });
  };

  var setRule = function(type, color){
    type = type.toLowerCase();
    var selector = type[0] == "." ? type : "." + type;
    var rule = getRule(selector);
    if (rule){
      rule.style.color = color;
    } else {
      sheet.insertRule(selector + "{ background-color : " + color + " }", 0);
    }
  };

  return {
    'getRule' : getRule,
    'hasRule' : hasRule,
    'getRules' : getRules,
    'setRule' : setRule,
    'deleteRule' : deleteRule,
    'refreshRules' : refreshRules
  };
});
