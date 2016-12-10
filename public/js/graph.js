//based loosely on bostock's example and
//http://bl.ocks.org/d3noob/5141278
d3.graph = function(d3, id, W, H, data, transformCloud) {

    d3.select("#reset").on("click", reset);

     //defaults
    var graph = {},
        //mw = 20, mh = 50,
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0,
        canvasID = id; //canvasID must have hash like "#vis" or "#canvas"
    var vis, svgGroup, defs;
    var count = 0;

  var nodes = data.nodes;
  var links = data.links;

  var weights = [];

  for (i in links) {
     if (count<links[i].value) count = links[i].value;

     if(weights.indexOf(links[i].weight) == -1){weights.push(links[i].weight);}
  }

  var force = d3.layout.force()
      .charge([-250])
      .linkDistance([50])
      .size([width, height])
      .nodes(nodes)
      .links(links)
      .on('start', start)
      .start();

  var drag = force.drag();
  drag.on("dragstart",dragstart);

  var visID = canvasID.substr(4);
  var finalTranslate = [519, 211];
  var finalScale = 1;
  var transformObject = BridgesVisualizer.getTransformObject(visID, transformCloud);
  if(transformObject){
       finalTranslate = [transformObject.translatex,transformObject.translatey];
       finalScale = transformObject.scale;
  }


  // error when zooming directly after pan on OSX
  // https://github.com/mbostock/d3/issues/2205
   var zoom = d3.behavior.zoom()
          .scaleExtent([0.1,5])
          .on("zoom", zoomHandler)
          // .scale(finalScale)
          // .translate(finalTranslate);
      allZoom.push(zoom);

  var defaultColors = d3.scale.category20(); //10 or 20

  vis = d3.select(canvasID).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "svg" + canvasID.substr(4))
      .classed("svg", true)
      .call(zoom);

  svgGroup = vis.append("g")
        .attr("transform", "translate(" + finalTranslate + ")scale(" + finalScale + ")");

  allSVG.push(svgGroup);

  vis.append("svg:defs").selectAll("marker")
      .data(weights)// Different path types defined here
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerUnits", "userSpaceOnUse")
      .style("fill", function (d) {
          return BridgesVisualizer.getColor(d.color) || "black";
      })
      .style("opacity", function(d) {
          return d.opacity || 1;
      })
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  var link = svgGroup.append("svg:g").selectAll("g.link")
      .data(force.links())
      .enter().append("g")
      .attr("class", "link");

  var linkPath = link.append("svg:path")
      .attr("class", function(d) { return "link " + d.weight; })
      .attr("marker-end", function(d) { return "url(#" + d.weight + ")"; })
      .style("stroke-width", function (d) { return BridgesVisualizer.strokeWidthRange(d.thickness) || 1; })
      .style("stroke", function (d) { return BridgesVisualizer.getColor(d.color) || "black"; })
      .style("opacity", function(d) { return d.opacity || 1; })
      .style("stroke-dasharray", function(d) { return d.dasharray || ""; })
      .style("fill", "none");

  var textPath = link.append("svg:path")
      .attr("id", function(d) { return d.source.index + "_" + d.target.index; })
      .attr("class", "textpath");

  var path_label = svgGroup.append("svg:g").selectAll(".path_label")
      .data(force.links())
      .enter().append("svg:text")
      .attr("class", "path_label")
      .append("svg:textPath")
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .attr("xlink:href", function(d) { return "#" + d.source.index + "_" + d.target.index; })
      .text(function(d) { return d.weight; });

  //outer node
  var node = svgGroup.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .on("mouseover", BridgesVisualizer.textMouseover)
      .on("mouseout", BridgesVisualizer.textMouseout)
      .on("dblclick", dblclick)
      .call(force.drag);

  //inner nodes
  node
      .append('path')
      .attr("class", "node")
      .attr("d", d3.svg.symbol()
          .type(function(d) { return d.shape || "circle"; })
          .size(function(d) {return BridgesVisualizer.scaleSize(d.size || 1); })
      )
      .style("fill", function(d, i) {
          return BridgesVisualizer.getColor(d.color) || defaultColors(i);
      })
      .style("opacity", function(d) {
          return d.opacity || 1;
      });

  //inner nodes
  node
      .append("text")
      .attr("class","nodeLabel")
      .attr("x", BridgesVisualizer.textOffsets.graph.x + 2)
      .attr("y",  BridgesVisualizer.textOffsets.graph.y + 14)
      .style("color",'black')
      .style("pointer-events", "none")
      .style("opacity", 0.0)
      .text(function(d) {
          return d.name;
      });



  // Add line breaks to node labels
  // insertLinebreaks is never used. But also, it moves the linklabels to not work.
  // svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);


  function start() {
      requestAnimationFrame(function render() {
        for (var i = 0; i < BridgesVisualizer.getTicksPerRender(); i++) {
          force.tick();
         }

         BridgesVisualizer.setTicksPerRender(5);

         node
            .attr("transform", function(d, i) {
              return "translate(" + d.x + "," + d.y + ")";
            });

            linkPath.attr("d", function(d) {
              return arcPath(false, d);
            });

            textPath.attr("d", function(d) {
              return arcPath(d.source.x < d.target.x, d);
            });

        if (force.alpha() > 0) {
            requestAnimationFrame(render);
        }

      })
  }

  // zoom function
  function zoomHandler() {
      svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  // Handle doubleclick on node path (shape)
  function dblclick(d) {
      d3.event.stopImmediatePropagation();
      d3.select(this).classed("fixed", d.fixed = false);
  }

  // Handle dragstart on force.drag()
  function dragstart(d) {
       d3.event.sourceEvent.stopPropagation();
       d3.select(this).classed("fixed", d.fixed = true);
       force.start();
  }


  function arcPath(leftHand, d) {
     var start = leftHand ? d.source : d.target,
         end = leftHand ? d.target : d.source,
         dx = end.x - start.x,
         dy = end.y - start.y,
         dr = Math.sqrt(dx * dx + dy * dy),
         sweep = leftHand ? 0 : 1;
     return "M" + start.x + "," + start.y + "A" + dr + "," + dr + " 0 0," + sweep + " " + end.x + "," + end.y;
  }

};
