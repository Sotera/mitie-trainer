define(['underscore-contrib', 'd3', 'jquery', 'windows'], function(_, d3, $, windows){

  var publish = function(d, i){
    windows.publish("node.click", d);
  };
  
  var render = function(){

    windows.subscribe("node.highlight", function(node_name){
      console.log(node_name);
    });

    var width = $('#widget-canvas').width(),
    height = $('#widget-canvas').height();

    var color = d3.scale.category20();

    var force = d3.layout.force()
      .linkStrength(2)
      .linkDistance(30)
      .size([width, height]);

    var redraw = function(){
      d3.select("svg")
        .select("g")
        .attr("transform",
              "translate(" + d3.event.translate + ")" +
              " scale(" + d3.event.scale + ")");
    };

    var svg = d3.select("#widget-canvas").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("pointer-events", "all")
      .call(d3.behavior.zoom().on("zoom", redraw));
    
    var vis = svg.append('svg:g');

    //resize svg on container resize event
    $('#widget-canvas').resize(function(){
      var width = $('#widget-canvas').width(),
      height = $('#widget-canvas').height();
      svg.attr("width", width).attr("height", height);
    });

    d3.json("data/graph.json", function(error, graph) {
      var nodes = graph.nodes.slice();
      var links = [];
      var bilinks = [];
      
      graph.links.forEach(function(link) {
        var s = nodes[link.source];
        t = nodes[link.target];
        w = link.value;
        i = {}; // intermediate node
        nodes.push(i);
        links.push({source: s, target: i}, {source: i, target: t});
        bilinks.push([s, i, t, w]);
      });

      force.nodes(nodes)
        .links(links)
        .start();

      vis.append("svg:defs").selectAll("marker")
        .data(["end"])
        .enter()
        .append("svg:marker")
        .attr("id", String)
        .attr("viewBox","0 -5 10 10")
        .attr("refX",15)
        .attr("refY",0)
        .attr("markerWidth",7)
        .attr("markerHeight",7)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

      var link = vis.selectAll(".link")
        .data(bilinks)
        .enter().append("path")
        .attr("class", "link").attr("marker-end", "url(#end)")
        .style("stroke", "black")
        .style("stroke-width", function(d) { 
          var w = 0.15 + (d[3] / 500);  
          return ( w > 3) ? 3 : w;
        });

      var node = vis.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node");

      node.append("svg:circle")
        .attr("r", function(d) { 
          return Math.log((d.num * 100));
        })
        .style("fill", function(d) { 
          return color(d.name);
        })
        .style("stroke","red")
        .call(force.drag);
      
      node.append("title")
        .text(function(d) { 
          return d.name;
        });

      force.on("tick", function() {
        link.attr("d", function(d) {
          return "M" + d[0].x + "," + d[0].y +
            "S" + d[1].x + "," + d[1].y +
            " " + d[2].x + "," + d[2].y;
        });

        node.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";});
      });
    });
  };

  return {
    render : render
  };
});
