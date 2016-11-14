/*
Circular Doubly Linked List visualization for Bridges
*/
d3.cdllist = function(d3, canvasID, w, h, data, transformCloud) {
    var visID = canvasID.substr(4);
    var finalTranslate = [50, -5];
    var finalScale = 0.36;
    // var svgGroup;

    var transformObject = BridgesVisualizer.getTransformObject(visID, transformCloud);
    if(transformObject){
         finalTranslate = [transformObject.translatex,transformObject.translatey];
         finalScale = transformObject.scale;
    }else{
      console.log("Loaded from default!");
    }

    // var spacing = 5;        // spacing between elements
    var spacing = 115;
    var marginLeft = 20;
    var defaultSizeH = 100;  // default size of each element box
    var defaultSizeW = 160;  // default size of each element box
    var elementsPerRow = 4 * parseInt((w - (spacing + defaultSizeH)) / (spacing + defaultSizeH));

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
            size = defaultSizeH;
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + size)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+size))) + ")";
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
            return defaultSizeH;
        })
        .attr("width", function(d) {
            return defaultSizeW;
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
        .attr("x", defaultSizeW / 2 - 5);

    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 130)
        .attr("x2", 130)
        .attr("stroke", "black")
        .attr("stroke-width",2)
        // .attr("marker-end","url('#Triangle')")
    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 30)
        .attr("x2", 30)
        .style("stroke", "black")
        .attr("stroke-width",2)
        // .attr("marker-end","url('#Triangle')")

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
            return d.name.substr(0,5)+"...";
        })
        .attr("fill", "black")
        .attr("x", 40)
        .attr("y", defaultSizeH / 2)
        .attr("dy", ".35em");

    nodes
        .append("line")
        .attr("class","forward-link")
        .attr("id", function(d,i){
            return "svg"+visID+"pointer-arrow-"+i;
        })
        .attr("y1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 160;
          }else{
            return 30;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return defaultSizeH - 70;
          }else{
            return 30;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 155;
          }else{
            return 145;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 155;
          }else{
            return 225;
          }
        })
        .attr("stroke",function(d,i){
            if(d.forwardlink) return BridgesVisualizer.getColor(d.forwardlink.color);
            else "black";
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

    nodes
        .append("line")
        .attr("class","backward-link")
        .attr("id", function(d,i){
            return "svg"+visID+"pointer-arrow-two"+i;
        })
        .attr("y1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 130;
          }else{
            return 70;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return defaultSizeH - 25;
          }else{
            return 70;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 135;
          }else{
            return 152;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 135;
          }else{
            return 232;
          }
        })
        // .attr("stroke","pink")
        .attr("stroke",function(d,i){
            if(d.backwardlink != undefined && d.backwardlink.color) return BridgesVisualizer.getColor(d.backwardlink.color);
            else return "black";
        })
        .attr("stroke-width",5)
        .attr("marker-end",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return "url('#Triangle')";
          }else{
            return "url('#Circle')";
          }

        })
        .attr("marker-start",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            // return "url('#Triangle')";
          }else{
            return "url('#Triangle')";
          }

        });


      var data_length = Object.keys(data).length;
      for(var qq = elementsPerRow-1; qq < data_length; qq=qq+ (1*elementsPerRow) ){
          d3.select(d3.select("#svg"+visID+"pointer-arrow-"+qq)[0][0].parentNode)
              .append("line")
              .attr("class","backward-horizontal-link")
              .attr("stroke",function(d,i){
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
                // d3.select(this.parentNode).select(".forward-link").attr("x1");
                return ( (elementsPerRow-1) * (-1*(spacing + defaultSizeH) ) ) + 25;
                // return 40;
              })
              .attr("x2", function(d,i){
                return d3.select(this.parentNode).select(".forward-link").attr("x1");
                // return 80;
              })
              .attr("display",function(d,i){
                  if(Object.keys(data).length-1 == qq){
                      return "none";
                  }
              });


        d3.select(d3.select("#svg"+visID+"pointer-arrow-two"+qq)[0][0].parentNode)
            .append("line")
            .attr("class","forward-horizontal-link")
            .attr("stroke",function(d,i){
                return d3.select(this.parentNode).select(".backward-link").attr("stroke") || "black";
            })
            .attr("stroke-width",5)
            .attr("y1", function(d,i){
              return d3.select(this.parentNode).select(".backward-link").attr("y1");
            })
            .attr("y2", function(d,i){
              return d3.select(this.parentNode).select(".backward-link").attr("y1");
            })
            .attr("x1", function(d,i){
              return ( (elementsPerRow-1) * (-1*(defaultSizeH + spacing)) ) + 5;
            })
            .attr("x2", function(d,i){
              return d3.select(this.parentNode).select(".backward-link").attr("x1");
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
            .attr("stroke",function(d,i){
                return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
            })
            .attr("stroke-width",5)
            .attr("y1", function(d,i){
                return parseInt(d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1")) - 3;
            })
            .attr("y2", function(d,i){
                return parseInt( d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1") ) + 75;
            })
            .attr("x1", function(d,i){
              return d3.select(this.parentNode).select(".backward-horizontal-link").attr("x1");
            })
            .attr("x2", function(d,i){
              return d3.select(this.parentNode).select(".backward-horizontal-link").attr("x1");
            })
            .attr("marker-end","url('#Triangle')")
            .attr("display",function(d,i){
              if(Object.keys(data).length-1 == qq){
                  return "none";
              }
            });
        d3.select(d3.select("#svg"+visID+"pointer-arrow-two"+qq)[0][0].parentNode)
            .append("line")
            .attr("stroke",function(d,i){
                return d3.select(this.parentNode).select(".backward-link").attr("stroke") || "black";
            })
            .attr("stroke-width",5)
            .attr("y1", function(d,i){
                return parseInt(d3.select(this.parentNode).select(".forward-horizontal-link").attr("y1")) - 3;
            })
            .attr("y2", function(d,i){
                return parseInt( d3.select(this.parentNode).select(".forward-horizontal-link").attr("y1") ) + 155;
            })
            .attr("x1", function(d,i){
                return d3.select(this.parentNode).select(".forward-horizontal-link").attr("x1");
            })
            .attr("x2", function(d,i){
              return d3.select(this.parentNode).select(".forward-horizontal-link").attr("x1");
            })
            .attr("marker-end","url('#Circle')")
            .attr("display",function(d,i){
              if(Object.keys(data).length-1 == qq){
                  return "none";
              }
            });
    }


    for(var qq = 0; qq < Object.keys(data).length; qq++){
        d3.select("#svg"+visID+"g"+qq).moveToBack();
    }

    var last_g = svgGroup.select("#svg"+visID+"g"+parseInt(Object.keys(data).length-1));

    last_g
        .select(".forward-link")
        .attr("marker-start","")
        .attr("marker-end",function(){
          return "url('#Circle')";
        })
        .attr("x1",135)
        .attr("x2",135)
        .attr("y1",140)
        .attr("y2",defaultSizeH / 2);

    last_g
        .select(".backward-link")
        .attr("marker-start","")
        .attr("marker-end","url('#Circle')")
        .attr("x1",155)
        .attr("x2",155)
        .attr("y1",160)
        .attr("y2",defaultSizeH / 2);

    last_g
        .append("line")
        .attr("class","last-g-horizontal-line")
        .attr("x1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".forward-link").attr("x1"));
        })
        .attr("x2", function(d,i){
              var number_of_rows_left = (-1*( parseInt(Object.keys(data).length) % elementsPerRow)) + elementsPerRow;
              if( number_of_rows_left ==  elementsPerRow-1){
                  return (-1*(defaultSizeH + spacing)) + 134;
              }

              if( (Object.keys(data).length) % elementsPerRow == 0){
                    return ((elementsPerRow-1) * (-1*(defaultSizeH + spacing)) ) - 80;
              }

              number_of_rows_left = parseInt(Object.keys(data).length) % elementsPerRow;
              return ((number_of_rows_left) * (-1*(defaultSizeH + spacing)) ) + 130;
        })
        .attr("y1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".forward-link").attr("y1")) - 3;
        })
        .attr("y2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".forward-link").attr("y1")) - 3;
        })
        .attr("stroke",function(d,i){
            return d3.select(this.parentNode).select(".forward-link").attr("stroke");
        })
        .attr("stroke-width",5);

    last_g
        .append("line")
        .attr("class","last-g-vertical-line")
        .attr("x1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("x2"));
        })
        .attr("x2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("x2"));
        })
        .attr("y1", function(d,i){
              if( (Object.keys(data).length) % elementsPerRow == 0){
                var number_of_rows_left = parseInt(Object.keys(data).length / elementsPerRow) - 1;
                return (-1 * ((number_of_rows_left * (defaultSizeH + spacing) )) ) + 70;
              }

              var number_of_rows_left = parseInt(Object.keys(data).length / elementsPerRow);
              return (-1 * ((number_of_rows_left * (defaultSizeH + spacing) )) ) + 70;
        })
        .attr("y2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("y1"));
        })
        .attr("stroke",function(d,i){
            return d3.select(this.parentNode).select(".forward-link").attr("stroke");
        })
        .attr("stroke-width",5);

    last_g
        .append("line")
        .attr("x2", function(d,i){
            return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("x2"));
        })
        .attr("x1", function(d,i){
            return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("x2")) + 60;
        })
        .attr("y1", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("y1"));
        })
        .attr("y2", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("y1"));
        })
        .attr("stroke",function(d,i){
          return d3.select(this.parentNode).select(".forward-link").attr("stroke");
        })
        .attr("stroke-width",5)
        .attr("marker-start","url('#Circle')");

    last_g
        .append("line")
        .attr("class","last-g-horizontal-line-two")
        .attr("x1", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".backward-link").attr("x1"));
        })
        .attr("x2", function(d,i){
              var number_of_rows_left = (-1*( parseInt(Object.keys(data).length) % elementsPerRow)) + elementsPerRow;
              if( number_of_rows_left ==  elementsPerRow-1){
                  return (-1* (defaultSizeH + spacing) ) + 104;
              }

              if( (Object.keys(data).length) % elementsPerRow == 0){
                    return ((elementsPerRow-1) * (-1*(defaultSizeH + spacing)) ) + 110;
              }

              number_of_rows_left = parseInt(Object.keys(data).length) % elementsPerRow;
              return ((number_of_rows_left) * (-1*(defaultSizeH + spacing)) ) + 100;
        })
        .attr("y1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".backward-link").attr("y1")) - 3;
        })
        .attr("y2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".backward-link").attr("y1")) - 3;
        })
        .attr("stroke",function(d,i){
          return d3.select(this.parentNode).select(".backward-link").attr("stroke");
        })
        .attr("stroke-width",5);

    last_g
        .append("line")
        .attr("class","last-g-vertical-line-two")
        .attr("x1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line-two").attr("x2"));
        })
        .attr("x2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line-two").attr("x2"));
        })
        .attr("y1", function(d,i){
              number_of_rows_left = parseInt(Object.keys(data).length / elementsPerRow);
              if( (Object.keys(data).length) % elementsPerRow == 0){
                number_of_rows_left = parseInt(Object.keys(data).length / elementsPerRow) - 1;
                return (-1 * ((number_of_rows_left * (defaultSizeH + spacing) )) ) + 30;
              }
              return (-1 * ((number_of_rows_left * (defaultSizeH + spacing) )) ) + 30;
        })
        .attr("y2", function(d,i){
              // number_of_rows_left = ( parseInt(Object.keys(data).length) / elementsPerRow) + elementsPerRow;
              return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line-two").attr("y1"));
        })
        .attr("stroke",function(d,i){
              return d3.select(this.parentNode).select(".backward-link").attr("stroke");
            // return d.linktargetcolor || "black";
        })
        .attr("stroke-width",5);

    last_g
        .append("line")
        .attr("x2", function(d,i){
            return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line-two").attr("x2"));
        })
        .attr("x1", function(d,i){
            return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line-two").attr("x2")) + 90;
        })
        .attr("y1", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line-two").attr("y1"));
        })
        .attr("y2", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line-two").attr("y1"));
        })
        .attr("stroke",function(d,i){
              return d3.select(this.parentNode).select(".backward-link").attr("stroke");
        })
        .attr("stroke-width",5)
        .attr("marker-start","url('#Triangle')");

    last_g.select(".forward-link").attr("y2",80).attr("marker-end","url('#Triangle')");
    last_g.select(".backward-link").attr("y2",30);


    // bind linebreaks to text elements
    svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};