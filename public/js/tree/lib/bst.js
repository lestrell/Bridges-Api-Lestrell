//This code is heavily based on code from
//http://mbostock.github.io/d3/talk/20111018/tree.html



d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var scaleSize = d3.scale.linear()
    .domain([1,100])
    .range([80,4000]);

var markers = [
   { id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12' },
   { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' },
   { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' },
   { id: 2, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
];

d3.bst = function (d3, canvasID, w, h) {

//    d3.select("#reset").on("click", reset);

    //defaults
    var bst = {},
        mw = 0, mh = 0,
        w = w || 1280,
        h = h || 800,
        i = 0,
        tree,
        depthStep = 75,
        canvasID = canvasID, //canvasID must have hash like "#vis" or "#canvas"
        root;
    var svgGroup, defs;

    var drag = d3.behavior.drag()
        //.origin(function(d) {  });
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);

    // error when zooming directly after pan on OSX
    // https://github.com/mbostock/d3/issues/2205
    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1,5])
        //.on("dblclick.zoom",null)
        .on("zoom", zoomHandler);
        //.on("mousedown.zoom",null);
        zoom.scale(1);
    zoom.translate([(w/2), 0]);
    allZoom.push(zoom);

    bst.init = function (_w, _h, _mw, _mh, ds) {
        mw = _mw;
        mh = _mh;
        w = _w;
        h = _h;
        depthStep = ds;
        return bst;
    };

    //boilerplate stuff
    bst.make = function (data) {
        tree = d3.layout.tree()
            .nodeSize([50, 50]);
        diagonal = d3.svg.diagonal();
            //.projection(function(d, i) { if(i >= 0) return [d.x + 50, d.y]; else return [d.x, d.y] });

        vis = d3.select(canvasID).append("svg:svg")
            .attr("width", w )
            .attr("height", h )
            .attr("id", "svg" + canvasID.substr(4))
            .classed("svg", true)
            //.attr("height", h * 2)
            .call(zoom)
            .call(drag);

        svgGroup = vis.append("svg:g")
            .attr("transform", "translate(" + (mh + (w/2)) + "," + mw + ")");
        allSVG.push(svgGroup);

        defs = vis.append('svg:defs');

       var marker = defs.selectAll('marker')
         .data(markers)
         .enter()
         .append('svg:marker')
           .attr('id', function(d){ return 'marker_' + d.name; })
           .attr("markerUnits", "userSpaceOnUse")
           .attr('markerHeight', 5)
           .attr('markerWidth', 5)
           //.attr('markerUnits', 'strokeWidth')
           .attr('orient', 'auto')
           .attr('refX', 0)
           .attr('refY', 0)
           .attr('viewBox', function(d){ return d.viewbox; })
           .append('svg:path')
             .attr('d', function(d){ return d.path; })
             .attr('fill', function(d,i) { return "#ccc"; });

        root = data;
        root.x0 = 0;
        root.y0 = (w) / 2;

        update(root);
    };

    return bst;

    function toggle (elem, d) {
        // d3.select(d.parent).style("stroke", "yellow").style("stroke-width", 5);
        if (d.children) {
            d3.selectAll(".node").selectAll("path").style("stroke", "yellow").style("stroke-width", 0);
            d3.select(elem).select("path").style("stroke", "yellow").style("stroke-width", 5);
            d._children = d.children;
            d.children = null;
        } else {
            d3.selectAll(".node").selectAll("path").style("stroke", "yellow").style("stroke-width", 0);
            d3.select(elem).select("path").style("stroke", "yellow").style("stroke-width", 5);
            d.children = d._children;
            d._children = null;
        }
    }

    function update(source) {
        var duration = 600;

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse();

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = 50 + d.depth * depthStep; });
        // nodes.forEach(function(d) { d.x = -1 * d.x; }); // -1 here flips. Fixed for new representation

        // Update the nodes…
        var node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); })
            .on("mouseover", BridgesVisualizer.textMouseover)
            .on("mouseout", BridgesVisualizer.textMouseout);

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            // .attr("d", d3.svg.symbol()
            //     .type(function(d) { return d.shape || "rect"; })
            //     .size( 1 )
            // )
            .attr("transform", function(d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on("click", function(d) {
                if(d.children && d.children[0].name == "NULL" && d.children[1].name == "NULL"){
                    console.log(d);
                }else{
                    toggle(this, d);
                    update(d);
                }
             })
            .on("mouseover", BridgesVisualizer.textMouseover)
            .on("mouseout", BridgesVisualizer.textMouseout)
            .style("display",function(d){
                if(!d.color && !d.size){
                    return "none";
                }
            });
            // .on("mouseover", mouseover)
            // .on("mouseout", mouseout);

        nodeEnter.append('path')
            .attr("d", d3.svg.symbol()
                .type(function(d) { return d.shape || "rect"; })
                .size(function(d) { return scaleSize(d.size) || 1; })
            )
            .style("fill", function(d) {
                return BridgesVisualizer.getColor(d.color) || "#000";
            })
            .style("opacity", function(d) {
                return d.role ? 0 : ( d.opacity || 1 );
            });

        nodeEnter.append("svg:text")
            .classed("nodeLabel", true)
            .attr("dy", ".35em")
            .attr("x", "20px")
            .attr("y",  "-7px")
            .attr("text-anchor", "start")
            .style("display", "none")
            .text( function( d ) { return d.name; } );

       if(nodes[0].key !== null) {
           nodeEnter.append("svg:text")
            .classed("nodeKey", true)
            .attr("dy", ".35em")
            .attr("x", "-8px")
            .attr("y",  "-25px")
            .attr("text-anchor", "start")
            // .style("display", "none")
            .text(function(d) { return d.key || ""; } );
       }


        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                // var dx = d.x-15;
                var dx = d.x;
                return "translate(" + dx + "," + d.y + ")";
            });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + (source.x) + "," + source.y + ")";
            })
            .remove();

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(tree.links(nodes), function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .style("stroke", function(d,i) {
                if(d.target.linkProperties) return BridgesVisualizer.getColor(d.target.linkProperties.color);
                return "#ccc";
            })
            .style("stroke-width", function(d,i) {
                if(d.target.linkProperties) return BridgesVisualizer.strokeWidthRange(d.target.linkProperties.thickness);
                return BridgesVisualizer.strokeWidthRange(1);
            })
            .style("opacity", function(d,i) {
                if(d.target.name == "NULL") return 0;
                return d.opacity || 1;
            })
            .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal({source: o, target: o});
            })
            .attr('marker-start', function(d,i){ return 'url(#marker_circle)'; })
            .attr('marker-end', function(d,i){ return 'url(#marker_arrow)'; })
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            })
            .remove();
        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Add line breaks to node labels
        svgGroup.selectAll('text.nodeLabel').each(BridgesVisualizer.insertLinebreaks);
    }


// //    // zoom function
function zoomHandler() {
    //console.log("zoom");
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted() {
    //console.log("dragstart");
    //d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged() {
     //console.log("dragging");
    //svgGroup.attr("transform", "translate(" + d3.event.translate + ")");
}
function dragended() {
//    console.log("dragend");
    d3.select(this).classed("dragging", false);
}

// function mouseover() {
//     // d3.select(this).select("text").transition()
//     //     .duration(750)
//     //     .style("display","block");
//     BridgesVisualizer.textMouseover(this, "tree");
//     // var el = d3.select(this);
//     // el.moveToFront();
// }
//
// function mouseout() {
//     // d3.select(this).select("text").transition()
//     //     .duration(750)
//     //     .style("display","none");
//     BridgesVisualizer.textMouseout(this);
// }

};
