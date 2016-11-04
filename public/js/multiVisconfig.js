// Bridges visualizer object to remove vis methods from the global scope
BridgesVisualizer.strokeWidthRange = d3.scale.linear().domain([1,10]).range([1,15]).clamp(true);

// Offsets for text labels for visualization types
BridgesVisualizer.textOffsets = {
  "graph": { "x": 22, "y": -10 },
  "tree": { "x": 200, "y": -15 },
  "default": { "x": 0, "y": 0}
};

// function to return color depending on the style of representation
BridgesVisualizer.getColor = function(color) {
  if(Array.isArray(color))
    return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
  return color;
};

// bind linebreaks to text elements
BridgesVisualizer.insertLinebreaks = function (d, i) {
        var el = d3.select(this);
        var words = d3.select(this).text().split('\n');
        el.text('');

        for (var j = 0; j < words.length; j++) {
            var tspan = el.append('tspan').text(words[j]);
            if (j > 0)
                tspan.attr('x', 0).attr('dy', '15');
        }
    };

// BridgesVisualizer.textMouseover = function(el, visType) {
//   var textElm = d3.select(el).select("text");
//   textElm.transition().delay(50).duration(750).style("opacity",1.0);
//   // var offset = (BridgesVisualizer.textOffsets[visType]) ? BridgesVisualizer.textOffsets[visType] : BridgesVisualizer.textOffsets["default"];
//   // rect = d3.select(el).insert("svg:rect", "text").classed("bgRect", true)
//   //   .attr("id", "bgRect")
//   //   .attr("x", offset.x)
//   //   .attr("y", offset.y)
//   //   .attr("width", 20 + textElm.node().textContent.length * 5)
//   //   .attr("height", 18 * textElm.node().childElementCount);
//   // console.log(rect);
//   // rect.transition().duration(500).style("opacity", 1.0);
// };
//
// BridgesVisualizer.textMouseout = function(el) {
//   d3.select(el).selectAll("#bgRect").transition().duration(500).style("opacity", 0.0);
//   d3.select(el).selectAll("#bgRect").transition().delay(500).remove();
//   d3.select(el).select("text").transition().duration(500).style("opacity", 0.0);
// };

// function to return the transformObject saved positions
BridgesVisualizer.getTransformObject = function(visID, transformCloud) {
    var transformObject = getTransformObjectFromCloud(transformCloud);
    if(transformCloud){
         return {"translatex":parseFloat(transformCloud.translatex),
                 "translatey":parseFloat(transformCloud.translatey),
                      "scale":parseFloat(transformCloud.scale)};
    }else{
        transformObject =  getTransformObjectFromCookie(visID);
        if(transformObject){
              return transformObject;
        }else{
              return undefined;
        }
    }
};

function getTransformObjectFromCloud(transformCloud){
    if(transformCloud &&
       transformCloud.hasOwnProperty("translatex")     &&
       transformCloud.hasOwnProperty("translatey")     &&
       transformCloud.hasOwnProperty("scale")          &&
       !isNaN(parseFloat(transformCloud.translatex))   &&
       !isNaN(parseFloat(transformCloud.translatey))   &&
       !isNaN(parseFloat(transformCloud.scale))){
               return {"translatex":parseFloat(transformCloud.translatex),
                       "translatey":parseFloat(transformCloud.translatey),
                            "scale":parseFloat(transformCloud.scale)};
    }else{
        return undefined;
    }
}

function getTransformObjectFromCookie(visID){
      var name = "vis"+visID+"-"+location.pathname + "=";
      // var name = cname + "=";
      var ca = document.cookie.split(';');
      // console.log(ca);
      for(var i=0; i<ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              // return c.substring(name.length, c.length);
              var cookieStringValue = c.substring(name.length, c.length);
              var cookieJSONValue;
              try{
                  cookieJSONValue = JSON.parse(cookieStringValue);
              }catch(err){
                  console.log(err, cookieStringValue);
              }

              if(cookieJSONValue&&
                 cookieJSONValue.hasOwnProperty("translatex") &&
                 cookieJSONValue.hasOwnProperty("translatey") &&
                 cookieJSONValue.hasOwnProperty("scale")){
                     return {"translatex":parseFloat(cookieJSONValue.translatex),
                             "translatey":parseFloat(cookieJSONValue.translatey),
                                  "scale":parseFloat(cookieJSONValue.scale)};
              }else{
                return undefined;
              }
          }
      }
      return undefined;
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

//scale values between 1 and 100 to a reasonable range
BridgesVisualizer.scaleSize = d3.scale.linear()
                              .domain([1,100])
                              .range([80,4000]);


// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

BridgesVisualizer.textMouseover = function(d) {
    //the design can be changed later, if not appropriate. Mainly for implementation
    if(d3.select(this).select("rect"))
        d3.select(this).select("rect").style("stroke", "yellow").style("stroke-width", 10);

    if(d3.select(this).select("path")){
            d3.select(this).select("path").transition()
                .duration(750)
                .attr('d', function (d) {
                    return d3.svg.symbol().type(d.shape||"circle")
                            .size(BridgesVisualizer.scaleSize(40))();
                }).style("stroke", "yellow").style("stroke-width", 5);
    }
    div.transition()
        .duration(200)
        .style("opacity", .9);
    div	.html(d.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
};

BridgesVisualizer.textMouseout = function(d) {
    if(d3.select(this).select("rect"))
        d3.select(this).select("rect").style("stroke", "gray").style("stroke-width", 2);

    if(d3.select(this).select("path")){
            d3.select(this).select("path").transition()
                .duration(750)
                .attr('d', function (d) {
                    return d3.svg.symbol().type(d.shape||"circle")
                            .size(BridgesVisualizer.scaleSize(d.size||1))();
                }).style("stroke", "").style("stroke-width", 0);
    }
    div.transition()
        .duration(500)
        .style("opacity", 0);
};

// bind event handlers for ui
d3.selectAll(".minimize").on("click", minimize);
d3.select("#reset").on("click", reset);
d3.select("#resize").on("click", resize);

allZoom = [];
allSVG = [];

var visCount = 0,
    minimizedCount = 0,
    maximizedCount = 0;

var map = map || null;
if( map )
  map( mapData );

console.log(data);
/* create new assignments  */
for (var key in data) {
  if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis" + key),
        width = ele.clientWidth - 15,
        height = ele.clientHeight + 15;

    if (d3.bst) {
        bst = d3.bst(d3, "#vis" + key, width, height);
        // tempAddChildNode(data[key]);
        bst.make(data[key]);
    }
    else if(d3.dllist){
        var sortedNodes = sortListByLinks(data[key]);
        d3.dllist(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
    }
    else if(d3.cdllist){
        var sortedNodes = sortListByLinks(data[key]);
        d3.cdllist(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
    }
    else if(d3.sllist){
        var sortedNodes = sortListByLinks(data[key]);
        d3.sllist(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
    }
    else if(d3.csllist){
        var sortedNodes = sortListByLinks(data[key]);
        d3.csllist(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
    }
    else if (d3.queue) {
        d3.queue(d3, "#vis" + key, width, height, data[key].nodes, data[key].transform);
    }
    else if (d3.array) {
          d3.array(d3, "#vis" + key, width, height, data[key].nodes, data[key].transform);
    }
    else if (d3.array2d) {
          d3.array2d(d3, "#vis" + key, width, height, data[key].nodes, data[key].dims, data[key].transform);
    }
    else if (d3.array3d) {
          d3.array3d(d3, "#vis" + key, width, height, data[key].nodes, data[key].dims, data[key].transform);
    }
    else if (d3.graph) {
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }
    else {
        console.log("unknown data type");
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }
    visCount++;
    maximizedCount++;
  }
}

// Reset positions and scales for all visualization divs
function reset() {
    for (var i = 0; i < allZoom.length; i++) {
        var zoom = allZoom[i];
        var svgGroup = allSVG[i];
        // console.log(data[i].transform);
        var transformFromCloud = getTransformObjectFromCloud(data[i].transform);
        if(transformFromCloud){
            zoom.translate([transformFromCloud.translatex, transformFromCloud.translatey]);
            zoom.scale(transformFromCloud.scale);
        }else{
            var transformFromCookie = getTransformObjectFromCookie(i);
            if(transformFromCookie){
                zoom.translate([transformFromCookie.translatex, transformFromCookie.translatey]);
                zoom.scale(transformFromCookie.scale);
            }else{
                zoom.scale(1);

                /* set default translate based on visualization type */
                if(d3.array) zoom.translate([20, 200]);
                if(d3.dllist || d3.sllist || d3.cdllist || d3.csllist){
                    zoom.translate([50, -5]);
                    zoom.scale(0.36);
                }
                else if(d3.bst) zoom.translate([(d3.select("#svg0").attr("width")/2), 0]);
                else zoom.translate([0, 0]);
            }
        }

        svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }
    saveVisStatesAsCookies();
}

// Toggle resizing of visualization divs (swaps between two sizes)
function resize() {
    var sentinel = false;

    for(var i = 0; i < visCount; i++) {
        if ((d3.select("#vis" + i)).attr("height") < 400)
            sentinel = true;
    }
    if(sentinel) {
        height *= 2;

        d3.selectAll(".assignmentContainer")
            .attr( "height", height );
        d3.selectAll(".svg")
            .attr( "height", height );
    } else {
        height /= 2;

        d3.selectAll(".assignmentContainer")
            .attr("height", height);
        d3.selectAll(".svg")
            .attr("height", height);
    }
}

// Toggle minimizing and maximizing visualization divs
function minimize() {
    //Collapse/Expand All
    if(this.id == "min") {
        if(d3.select(this).attr("minimized") == "true") {   //MAXIMIZE
            d3.selectAll(".assignmentContainer")
                .classed("assignmentContainerMinimized", false);
            d3.selectAll(".svg")
                .style("display", "block");
            d3.selectAll(".minimize")
                .attr("minimized", false)
                .text("-");

            maximizedCount = visCount;
            minimizedCount = 0;

        } else {    //MINIMIZE
            d3.selectAll(".assignmentContainer")
                .classed("assignmentContainerMinimized", true);
            d3.selectAll(".svg")
                .style("display", "none");
            d3.selectAll(".minimize")
                .attr("minimized", true)
                .text("+");

            maximizedCount = 0;
            minimizedCount = visCount;
        }

        return;
    }

    if(d3.select(this).attr("minimized") == "true") {   //MAXIMIZE
        d3.select("#vis" + this.id.substr(3))
            .classed("assignmentContainerMinimized", false);
        d3.select("#svg" + this.id.substr(3))
            .style("display", "block");
        d3.select(this).attr("minimized", false);
        d3.select(this).text("-");

        maximizedCount++;
        minimizedCount--;

        if(maximizedCount == visCount) {//ALL vis are minimized
            d3.select("#min")
                .attr("minimized", false)
                .text("-");
        }

    } else {    //MINIMIZE
        d3.select("#vis" + this.id.substr(3))
            .classed("assignmentContainerMinimized", true);
        d3.select("#svg" + this.id.substr(3))
            .style("display", "none");
        d3.select(this).attr("minimized", true);
        d3.select(this).text("+");

        minimizedCount++;
        maximizedCount--;

        if(minimizedCount == visCount) {//ALL vis are minimized
            d3.select("#min")
                .attr("minimized", true)
                .text("+");
        }
    }
}

// Asynchronously update the node positions
function savePositions () {
  var updateTheseNodes = {};

  // store indices for all fixed nodes
  for (var key in data) {
    updateTheseNodes[key] = {
      'fixedNodes': {},
      'unfixedNodes': {}
    };
    if (data.hasOwnProperty(key)) {
      d3.select("#vis" + key).selectAll(".node").each(function(d, i) {
        // we need to name the nodes so we can identify them on the server; indices don't suffice
        if(d.fixed) updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.x, "y": d.y};
        else updateTheseNodes[key].unfixedNodes["n" + i] = true;
      });
    }
  }

  // send fixed node indices to the server to save
  $.ajax({
      url: "/assignments/updatePositions/"+assignmentNumber,
      type: "post",
      data: updateTheseNodes
  }).done(function(status) {
      if(status == 'OK'){
          alertMessage("Node positions saved!", "success");
      } else {
          alertMessage("Unsuccessful. Try logging in!", "danger");
      }
  });
}

//Asynchronously update the vis transform values
//this method is just for testing, if approved, it still needs the ajax call and routing set up as well as the dabatase.
//It also can be used with the tree visualization
function saveTransform(){
    var visTransforms = {};
    // for (var key = 0; key < data.length; key++) {
    for (var key in data) {
        var transformObject = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));
        visTransforms[key] = {
          // "index": key,
          "scale": parseFloat(transformObject.scale[0]),
          "translatex": parseFloat(transformObject.translate[0]),
          "translatey": parseFloat(transformObject.translate[1])
        };
    }
    // console.log(visTransforms);

    // send scale and translation data to the server to save
    $.ajax({
        url: "/assignments/updateTransforms/"+assignmentNumber,
        type: "post",
        data: visTransforms
    }).done(function(status) {
        if(status == 'OK'){
            alertMessage("Scale and translation saved!", "success");
        } else {
            alertMessage("Unsuccessful. Try logging in!", "danger");
        }
    });
}

/*
 Create a tooltip from the given message and status
 status: success, danger, warning
*/
function alertMessage(message, status) {
  var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
  $("#updateStatus").html(message+"<br>"+today);
  $("#updateStatus").addClass("alert alert-" + status);
  $("#updateStatus").show();
  setTimeout(function(){
     $("#updateStatus").hide();
  },2500);
}

//this methods sorts any linkedlist by links
function sortListByLinks(unsortedNodes){
    var getTargetFromSource = {}, getLinkFromSource = {}, sortedNodes = [], head;
    var links = unsortedNodes.links;
    var nodes = unsortedNodes.nodes;

    for(var i = 0; i < links.length; i++){
        getTargetFromSource[links[i].source] = links[i].target;//assigning the link source as the key and the target as the value
        getLinkFromSource[links[i].source+"-"+links[i].target] = links[i];//creating a unique identifier for every link
    }

    // head = unsortedNodes.head || Object.keys(nodes).length-1;
    head = 0;
    // for(var h in nodes){//looping through the length of the nodes
    for(var i = 0; i < nodes.length; i++){
        var key = head + "-" + getTargetFromSource[head];//link from source to target
        var yek = getTargetFromSource[head] + "-" + head;//link from target to source
        if(getLinkFromSource[key]) nodes[head]['forwardlink'] = getLinkFromSource[key];//if there is a link, insert in the nodes
        if(getLinkFromSource[yek]) nodes[head]['backwardlink'] = getLinkFromSource[yek];//if there is a link, insert in the nodes
        if(nodes[head])sortedNodes.push(nodes[head]);
        head = getTargetFromSource[head];//getting the next target
        // if(!head)break;
    }
    // links = nodes = undefined; console.log(sortedNodes);
    return sortedNodes;
}

// Saved the translate and scale of every visualization in an assignemts
function saveVisStatesAsCookies(){
    // console.log(this);
    var exdays = 30;
    try{
      for (var key in data) {
          var cookieName = "vis"+key+"-"+location.pathname;
          var transformObject = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));

          var cookieValue = JSON.stringify({
                 "scale": parseFloat(transformObject.scale[0]),
            "translatex": parseFloat(transformObject.translate[0]),
            "translatey": parseFloat(transformObject.translate[1])
          });
          var d = new Date();
          d.setTime(d.getTime() + (exdays*24*60*60*1000));
          var expires = "expires=" + d.toGMTString();
          document.cookie = cookieName+"="+cookieValue+"; "+expires;
      }
      var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
      //  alertMessage("Scale and translation saved!", "success");
    } catch(err){
      console.log(err);
    }
}

// Save cookies when scale and translation are updated
//  only updates zoom after scrolling has stopped
try{
    var wheeling = null;
    $("svg").mouseup(saveVisStatesAsCookies);
    $("svg").on('wheel', function (e) {
      clearTimeout(wheeling);
      wheeling = setTimeout(function() {
        saveVisStatesAsCookies();
        wheeling = undefined;
      }, 250);
    });
}catch(err){
    console.log(err);
}
