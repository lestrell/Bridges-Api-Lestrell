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
  }else{
    console.log("Loaded from default!");
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
          // return 0.5;
          return d.opacity || 1;
      })
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  var link = svgGroup.append("svg:g").selectAll("path")
      // .data(links)
      .data(force.links())
      .enter().append("svg:path")

      .attr("class", "link")
	    .attr("id",function(d,i) { return "linkId_" + i; })
      .attr("marker-end", function(d) { return "url(#" + d.weight + ")"; })

      .style("stroke-width", function (d) {
          return BridgesVisualizer.strokeWidthRange(d.thickness) || 1;
      })
      .style("stroke", function (d) {
          return BridgesVisualizer.getColor(d.color) || "black";
      })
      .style("opacity", function(d) {
          return d.opacity || 1;
      })
      .style("stroke-dasharray", function(d) {
          return d.dasharray || "";
      })
      .style("fill", "none");

    var linktext = svgGroup.append("svg:g").selectAll("g.linklabelholder").data(force.links());

    linktext.enter().append("g").attr("class", "linklabelholder")
        .append("text")
            .attr("id", function(d,i){
                return "linklabel"+i;
             })
	          .style("font-size", "13px")
            // .attr("x", "50")
	          // .attr("y", "-20")
            //  //  .attr("text-anchor", "start")
            .attr("text-anchor", "middle")
	          // .style("fill","#000")
        .append("textPath")
            .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
            .text(function(d) {
	               return d.weight;
	       });

  // var use = svgGroup.append("use")
  // .data(links)
  //   .attr("xlink:href",function(d,i){
  //     return "#MyPath" + i;
  //   });
  //
  //   var textlink = svgGroup.append("text")
  //   .data(links)
  // .append("textPath")
  //   .attr("xlink:href", function(d,i){
  //     return "#MyPath" + i;
  //   }).text("JustImagine");


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

  force.on("tick", function() {
      node
        .attr("transform", function(d, i) {
          return "translate(" + d.x + "," + d.y + ")";
        });

      // link.attr("d", function(d) {
      //   var dx = d.target.x - d.source.x,
      //       dy = d.target.y - d.source.y,
      //       dr = Math.sqrt(dx * dx + dy * dy);
      //   return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      // });

      link
          .attr("d", function(d,i) {
              var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy);

              //center labels in links
              d3.select("#linklabel"+i).attr("x", dr/2);

              return "M" +
                  d.source.x + "," +
                  d.source.y + "A" +
                  dr + "," + dr + " 0 0,1 " +
                  d.target.x + "," +
                  d.target.y;
          });

          //http://stackoverflow.com/questions/34142010/show-d3-link-text-right-side-up
          //show-d3-link-text-right-side-up
          linktext.attr('transform', function (d) {
              // Checks just in case, especially useful at the start of the sim
              if (!(isVector(d.source) && isVector(d.target))) {
                  return '';
              }

              // Get the geometric center of the text element
              var box = this.getBBox();
              var center = {
                  x: box.x + box.width/2,
                  y: box.y + box.height/2
              };

              // Get the tangent vector
              var delta = {
                  x: d.target.x - d.source.x,
                  y: d.target.y - d.source.y
              };

              // Rotate about the center
              return 'rotate('
                  + ((-180/Math.PI*xAngle(delta)) || 0)
                  + (' ' + center.x || 0)
                  + (' ' + center.y || 0)
                  + ')';
              });

      // linktext.attr("x", function(d,i){
      //     return d3.select("#linkId_"+i).node().getBBox().y;
      // });


      // console.log(d3.select("#linkId_0").node().getBBox().y);
  });


  // function mouseover() {
  //     BridgesVisualizer.textMouseover(this, "graph");
  //     d3.select(this).select("path").transition()
  //         .duration(750)
  //         .attr('d', function (d) {
  //             return d3.svg.symbol().type(d.shape||"circle")
  //                     .size(BridgesVisualizer.scaleSize(40))();
  //         });
  // }
  //
  // function mouseout() {
  //     BridgesVisualizer.textMouseout(this);
  //     d3.select(this).select("path").transition()
  //         .duration(750)
  //         .attr('d', function (d) {
  //             return d3.svg.symbol().type(d.shape||"circle")
  //                     .size(BridgesVisualizer.scaleSize(d.size||1))();
  //         });
  // }

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

};


function xAngle(v) {
    return Math.atan(v.y/v.x) + (v.x < 0 ? Math.PI : 0);
}

function isFiniteNumber(x) {
    return typeof x === 'number' && (Math.abs(x) < Infinity);
}

function isVector(v) {
    return isFiniteNumber(v.x) && isFiniteNumber(v.y);
}
