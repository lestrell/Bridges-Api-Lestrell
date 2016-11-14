/*

Array visualization for Bridges

*/
d3.array = function(d3, canvasID, w, h, data, transformCloud) {

    var spacing = 5;        // spacing between elements
    var marginLeft = 20;
    var defaultSize = 100;  // default size of each element box

    var visID = canvasID.substr(4);
    var finalTranslate = [20, 200];
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
        .translate(finalTranslate)
        .scale(finalScale)
        .scaleExtent([0,5])
        .on("zoom", zoomHandler);
    allZoom.push(zoom);

    chart = d3.select(canvasID).append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svg" + canvasID.substr(4))
        .classed("svg", true)
        .call(zoom);
        // .call(BridgesVisualizer.tip);

    var svgGroup = chart.append("g");
    // initialize the scale and translation
    svgGroup.attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
    allSVG.push(svgGroup);

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + (marginLeft + i * (spacing + defaultSize)) + ")";
        })
        .on("mouseover", BridgesVisualizer.textMouseover)
        .on("mouseout", BridgesVisualizer.textMouseout);

    // Create squares for each array element
    nodes.append("rect")
        .attr("height", function(d) {
            return defaultSize;
        })
        .attr("width", function(d) {
            return defaultSize;
        })
        .style("fill", function(d) {
            return BridgesVisualizer.getColor(d.color) || "steelblue";
        })
        .style("stroke", "gray")
        .style("stroke-width", 2);

    // Show array index below each element
    nodes
        .append("text")
        .attr("class","index-textview")
        .text(function(d, i){
          return i;
        })
        .attr("y", 115)
        .attr("x", defaultSize / 2 - 5);

    // Show full array label above each element
    nodes
        .append("text")
        .attr("class","value-textview")
        .text(function(d, i){
          return d.name;
        })
        .attr("y", -10)
        .style("display","none");

    // Show array labels inside each element
    nodes
        .append("text")
        .attr("class", "value-elementview")
        .style("display", "block")
        .style("font-size", 30)
        .text(function(d) {
            return d.name.substr(0,10);
        })
        .attr("fill", "black")
        .attr("x", 10)
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");

    svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
