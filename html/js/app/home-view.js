define(['underscore-contrib', 'windows', 'hasher', 'ko', 'd3', 'app/utils', 'app/routes', 'app/data','app/main-window', 'jquery'], function(_, windows, hasher, ko, d3, utils, routes, data, main_window, $){

  var view = function(){
    var deferred = new $.Deferred();
    require(['text!templates/home_view.html'], function(tmpl){
      deferred.resolve(tmpl);
    });
    return deferred.promise();
  };

  var table_container = function(el){
    el.empty();
    el.append($('<table>').addClass("table").append($('<thead>')).append($('<tbody>')));
    return el;
  };

  var render_table = function(el, rows){

    var lastSort = "";

    var thead = d3.select(el[0])
      .select("thead")
      .append("tr")
      .selectAll("tr")
      .data(['ID', 'Snippet', 'Trained'])
      .enter().append("th").text(_.identity);

    var tr = d3.select(el[0]).select("tbody").selectAll("tr")
      .data(rows)
      .enter().append("tr")
      .attr("class", function(d){
        if (d[2]) return "success";
      })
      .on("click", function(d){
        utils.navigate(routes.TRAIN(d[0]))
      })
      .on("contextmenu", function(d, i){
        utils.navigate(routes.TEST(d[0]))
      })
      .on('mouseover', function(d){
        $(this).addClass('hover');
      })
      .on('mouseout', function(d){
        $(this).removeClass('hover');
      });

    var td = tr.selectAll("td")
      .data(_.identity)
      .enter().append("td")
      .html(function(d, i){
        if (i == 2){        
          if (d) {
            return $('<_>').append(
              $('<span>').addClass('glyphicon').addClass('glyphicon-ok')
            ).html();
          } else {
            return "";
          }
        }
        return d;
      });
  };

  var result_msg = ko.observable("");
  var result_msg_class = ko.observable("");

  var train = function(){
    var trainings = _.filter(data.trainings(), function(o){
      return o.tags.length > 0;
    });
    console.log({ 'trainings' : trainings });
    result_msg($('<O_o>').append($('<img>', { 'src': "img/ajax-loader.gif", 'width': '140px'})).html());    
    result_msg_class("");

    $.ajax({
      url:'train/train',
      type:"POST",
      data:JSON.stringify({ 'trainings' : trainings }),
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    }).done(function(resp){
      console.log(resp);
      result_msg($('<O_o>').append(
        $('<span>').addClass("glyphicon").addClass("glyphicon-ok-sign"), 
        $('<span>').html(" training complete")).html())
      result_msg_class("bg-success");
    }).fail(function(){
      result_msg($('<O_o>').append(
        $('<span>').addClass("glyphicon").addClass("glyphicon-remove-sign"), 
        $('<span>').html(" error")).html())
      result_msg_class("bg-danger");
    });
  };

  var save = function(){
    result_msg($('<O_o>').append($('<img>', { 'src': "img/ajax-loader.gif", 'width': '140px'})).html());    
    result_msg_class("");
    $.ajax({
      url:'train/save',
      type:"GET",
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    }).done(function(resp){
      result_msg($('<O_o>').append(
        $('<span>').addClass("glyphicon").addClass("glyphicon-ok"), 
        $('<a>').attr('target', '_blank').attr('href', resp.model).html(" Download")
      ).html());    
      result_msg_class("bg-success");
    }).fail(function(){
      result_msg($('<O_o>').append(
        $('<span>').addClass("glyphicon").addClass("glyphicon-remove-sign"),
        $('<span>').html(" error")).html())
      result_msg_class("bg-danger");
    });
  };

  var render = function(ref){
    view().then(function(tmpl){
      ref.empty();
      ref.html(tmpl);
      table = ref.find('.table-container');
      table_container(table);
      render_table(table, _.map(data.trainings(), function(d, i){ 
        return [i, d.text.substr(0, 150), d.tags.length > 0 ];
      }));
      var trainingCount = ko.observable(data.trainings().length);
      var trained = ko.observable(_.filter(data.trainings(), function(o){
        return o.tags.length > 0;
      }).length);

      main_window.panelClose();      

      var navigate_test = function(){
        utils.navigate(routes.TEST());
      };

      var training_save_handler = function(){
        var URL = window.URL || window.webkitURL;
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click");
        var el = document.createElement('a');
        el.download = "training_export_" +(+new Date) + ".json" ;
        var f = new Blob([JSON.stringify(data.trainings())], {'type': 'application/json'});
        el.href = URL.createObjectURL(f);
        el.dispatchEvent(evt);
      };

      var training_upload = function(){

        var fileSelected = function(evt) {
          var files = evt.target.files; // FileList object
          f = files[0];
          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = (function (theFile) {
            return function (e) { 
              var JsonObj = e.target.result
              console.log(JsonObj);
              var parsedJSON = JSON.parse(JsonObj);
              data.bulkload(parsedJSON);
              utils.navigate(routes.HOME("reload"));
            };
          })(f);

          // Read in JSON as a data URL.
          reader.readAsText(f, 'UTF-8');
        };

        $("#fileupload:file").off("change")
        $("#fileupload:file").one("change", fileSelected);
        $("#fileupload").trigger("click"); 
      };

      ko.applyBindings({ training_upload: training_upload, 
                         training_save: training_save_handler, 
                         test_handler: navigate_test, 
                         save: save, 
                         train: train, 
                         result_msg: result_msg,
                         result_msg_class: result_msg_class,
                         total: trainingCount, 
                         trained: trained
                       }, ref[0])
    });

  };

  return {
    'render' : render
  };
});
