define(['underscore-contrib', 'windows', 'hasher', 'ko', 'd3', 'app/utils', 'app/routes', 'app/data', 'jquery'], function(_, windows, hasher, ko, d3, utils, routes, data,  $){

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

  var train = function(){
    console.log('train');
  };

  var save = function(){
    console.log('save');
  };

  var render = function(ref){
    view().then(function(tmpl){
      ref.empty();
      ref.html(tmpl);
      table = ref.find('.table-container');
      table_container(table);
      render_table(table, _.map(data.trainings, function(d, i){ 
        return [i, d.text, d.tags.length > 0 ];
      }));

      var trainingCount = ko.observable(data.trainings.length);
      var trained = ko.observable(_.filter(data.trainings, function(o){
        return o.tags.length > 0;
      }).length);
      
      ko.applyBindings({ save: save, train: train, total: trainingCount, trained: trained }, ref[0]);
    });
  };

;

  return {
    'render' : render
  };
});
