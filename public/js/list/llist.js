/*

Linked List visualization for Bridges

*/

d3.sllist = function(d3, canvasID, w, h, data, transformCloud) {

    var visID = canvasID.substr(4);
    var finalTranslate = [50, -5];
    var finalScale = 0.36;

    var spacing = 115; // spacing between elements
    var marginLeft = 20;
    var defaultSize = 100;  // default size of each element box
    var defaultSizeW = 160;  // default size of each element box
    var elementsPerRow = 4 * parseInt((w - (spacing + defaultSize)) / (spacing + defaultSize));

    var transformObject = BridgesVisualizer.getTransformObject(visID, transformCloud);
    if(transformObject){
         finalTranslate = [transformObject.translatex,transformObject.translatey];
         finalScale = transformObject.scale;
    }
    // else{
    //   console.log("Loaded from default!");
    // }


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

    var svgGroup = chart.append("g");
    // initialize the scale and translation
    svgGroup.attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
    allSVG.push(svgGroup);

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("id",function(d,i){
          return "svg"+visID+"g"+i;
        })
        .attr("transform", function(d, i) {
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + defaultSize)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+defaultSize))) + ")";
        })
        .on("mouseover", BridgesVisualizer.textMouseover)
        .on("mouseout", BridgesVisualizer.textMouseout);

    // Create squares for each array element
    nodes
        .append("rect")
        .attr("id",function(d,i){
          return "svg"+visID+"rect"+i;
        })
        .attr("height", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSize;
        })
        .attr("width", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSizeW;
        })
        .style("fill", function(d) {
            if(d && d.color)return BridgesVisualizer.getColor(d.color);else return "steelblue";
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
        .attr("x", function(){
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSizeW);
        });

    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 130)
        .attr("x2", 130)
        .attr("stroke", "black")
        .attr("stroke-width",2);

    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 30)
        .attr("x2", 30)
        .style("stroke", "black")
        .attr("stroke-width",2);

    // Show full label above each element
    nodes
        .append("text")
        .attr("class","nodeLabel")
        .text(function(d, i){
          if(d && d.name) return d.name;
        })
        .attr("y", -10)
        .style("display","none");

    // Show array labels inside each element
    nodes
        .append("text")
        .attr("class", "nodeLabelInside")
        .style("display", "block")
        .style("font-size", 30)
        .text(function(d) {
            return BridgesVisualizer.getShortText(d.name);
        })
        .attr("fill", "black")
        .attr("x", function(){
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSizeW);
        })
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");


    nodes
        .append("line")
        .attr("class","forward-link")
        .attr("id", function(d,i){
            return "svg"+visID+"pointer-arrow-"+i;
        })
        .attr("y1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            // return 198;
            return 160;
          }else{
            return 50;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return defaultSize / 2;
          }else{
            return 50;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 145;
          }else{
            return 145;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 145;
          }else{
            return 225;
          }
        })
        .attr("stroke",function(d,i){
            if(d.forwardlink) return BridgesVisualizer.getColor(d.forwardlink.color);
            else return "black";
        })
        .attr("stroke-width",5)
        .attr("marker-end",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return "url('#Circle')";
          }else{
            return "url('#Triangle')";
          }

        })
        .attr("marker-start",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            // return "url('#Triangle')";
          }else{
            return "url('#Circle')";
          }

        });

        var data_length = Object.keys(data).length;
        for(var qq = elementsPerRow-1; qq < data_length; qq=qq+ (1*elementsPerRow) ){
            d3.select(d3.select("#svg"+visID+"pointer-arrow-"+qq)[0][0].parentNode)
                .append("line")
                .attr("class","backward-horizontal-link")
                .attr("stroke",function(){
                    return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
                })
                .attr("stroke-width",5)
                .attr("y1", function(d,i){
                  // console.log(  );
                  return d3.select(this.parentNode).select(".forward-link").attr("y1");
                })
                .attr("y2", function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("y1");
                })
                .attr("x1", function(d,i){
                  return ( (elementsPerRow-1) * (-1*(spacing + defaultSize)) ) + 15;

                })
                .attr("x2", function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("x1");
                })
                .attr("display",function(d,i){
                    if(Object.keys(data).length-1 == qq){
                        return "none";
                    }
                });
        }

        for(var qq = elementsPerRow-1; qq < data_length; qq=qq+ (1*elementsPerRow) ){
          d3.select(d3.select("#svg"+visID+"pointer-arrow-"+qq)[0][0].parentNode)
              .append("line")
              .attr("stroke",function(){
                  return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
              })
              .attr("stroke-width",5)
              .attr("y1", function(d,i){
                  return parseInt(d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1")) - 3;
              })
              .attr("y2", function(d,i){
                  return parseInt( d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1") ) + 100;
              })
              .attr("x1", function(d,i){
                return d3.select(this.parentNode).select(".backward-horizontal-link").attr("x1");
              })
              .attr("x2", function(d,i){
                return d3.select(this.parentNode).select(".backward-horizontal-link").attr("x1");
              })
              .attr("display",function(d,i){
                  if(Object.keys(data).length-1 == qq){
                      return "none";
                  }
              })
              .attr("marker-end","url('#Triangle')");
        }


        for(var qq = 0; qq < Object.keys(data).length; qq++){
            d3.select("#svg"+visID+"g"+qq).moveToBack();
        }

        var last_g = svgGroup.select("#svg"+visID+"g"+parseInt(Object.keys(data).length-1));

        last_g.select(".forward-link")
            .attr("class","nullarrowpointer")
            .attr("marker-start","url('#Circle')")
            .attr("marker-end","url('#Triangle')")
            .attr("x1",145)
            .attr("x2",225)
            .attr("y1",50)
            .attr("y2",50);

       var squareSize = 60;

      last_g
          .append("rect")
            .attr("height", function(d) {
                return squareSize;
            })
            .attr("width", function(d) {
                return squareSize;
            })
            .attr("x",function(d,i){
                return parseFloat( d3.select(this.parentNode).select(".nullarrowpointer").attr("x2") );
            })
            .attr("y", function(d,i){
              return squareSize - (squareSize/1.5);
            })
            .attr("fill","transparent")
            .attr("stroke","black")
            .attr("stroke-width",2);

        last_g
            .append("text")
            .text("X")
            .attr("font-size","83px")
            .attr("x",function(d,i){
                  return parseFloat( d3.select(this.parentNode).select(".nullarrowpointer").attr("x2") ) + 2;
            })
            .attr("y",squareSize+(squareSize/3))
            .attr("width",40)
            .attr("height",40)
            .style("display","block");


    svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);

    //transparent layer on top of the node, so the mouseover only enters to this rectangle on top.
    nodes
        .append("rect")
        .attr("height", function(d) {
            return defaultSize;
        })
        .attr("width", function(d) {
            return defaultSizeW + 52.5;
        })
        .style("opacity","0");

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

    // function mouseover(){
    //   BridgesVisualizer.textMouseover(this);
    // }
    //
    // function mouseout(){
    //   BridgesVisualizer.textMouseout(this);
    // }

};
