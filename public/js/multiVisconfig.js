String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

// Array.prototype.insert = function (index, item) {
//   this.splice(index, 0, item);
// };

(function($) {
    $.fn.hasNoScrollBar = function() {
        return !(this.get(0) ? this.get(0).scrollHeight > this.innerHeight() : false);
    }
})(jQuery);


var ticksPerRender = 2000;
BridgesVisualizer.getTicksPerRender = function(){
    return ticksPerRender;
}
BridgesVisualizer.setTicksPerRender = function(data){
    ticksPerRender = data;
}

BridgesVisualizer.centerTextHorizontallyInRect = function(obj, width){
    return (width - obj.getComputedTextLength()) / 2;
};

BridgesVisualizer.getShortText = function(text){
    if(text && text.length > 5){
      return text.substr(0,3)+"...";
    }else{
      return text;
    }
}
// Bridges visualizer object to remove vis methods from the global scope
BridgesVisualizer.strokeWidthRange = d3.scale.linear().domain([1,10]).range([1,15]).clamp(true);

// Offsets for text labels for visualization types
BridgesVisualizer.textOffsets = {
    "graph": { "x":  22,  "y": -10 },
     "tree": { "x":  20,  "y": -15 },
    "Alist": { "x": -20,  "y": -50 },
  "Array2D": { "x": -20,  "y": -20 },
  "Array3D": { "x": -20,  "y": -20 },
    "llist": { "x": -20,  "y": -20 },
   "dllist": { "x": -20,  "y": -20 },
  "cdllist": { "x": -20,  "y": -20 },
  "default": { "x":   0,  "y": 0   }
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

BridgesVisualizer.assignmentTypes = [];
BridgesVisualizer.tooltipEnabled = true;

// BridgesVisualizer.textMouseover = function(el) {
//   var textElm = d3.select(el).select(".nodeLabel");
//   var offset = (BridgesVisualizer.textOffsets[visType]) ? BridgesVisualizer.textOffsets[visType] : BridgesVisualizer.textOffsets["default"];
//   $("bridges-tooltip").offset({top:offset.y,left:offset.x}).html(textElm.text());
//
//   // textElm.transition().delay(50).duration(750).style("opacity",1.0);
//   // var offset = (BridgesVisualizer.textOffsets[visType]) ? BridgesVisualizer.textOffsets[visType] : BridgesVisualizer.textOffsets["default"];
//   // var g = d3.select(el).insert("svg:g").classed("bgRect",true);
//   //
//   // // console.log(textElm.text());
//   // var textValue = textElm.text();
//   // var textValueTemp = "";
//   // var count = 0;
//   // for(var i = 0; i < textValue.length; i++){
//   //     console.log(textValue[i]);
//   //     textValueTemp = textValueTemp + textValue[i];
//   //     if(count > 100){
//   //       textValueTemp = textValueTemp + "\n";
//   //       count = 0;
//   //     }
//   //     count++;
//   // }
//   //
//   // rect = g
//   //   .append("svg:rect")
//   //   .attr("x", offset.x + -10)
//   //   .attr("y", offset.y + -20)
//   //   .attr("fill","yellow")
//   //   // .attr("width", 50)
//   //   // .attr("height", 50)
//   //   .attr("width", 20 + textElm.node().textContent.length * 5)
//   //   .attr("height", 18 * textElm.node().childElementCount + (20))
//   //   .attr("opacity", 1);
//   // text = g
//   //   .append("svg:text")
//   //   .text(textValueTemp)
//   //   .attr("x", offset.x)
//   //   .attr("y", offset.y)
//   //   .attr("width", 50)
//   //   .attr("height", 50);
//   // // console.log(rect);
//   // // rect.insert(textElm)
//   // text.transition().duration(500);
// };
//
// BridgesVisualizer.textMouseout = function(el) {
//   // d3.select(el).selectAll(".bgRect").transition().duration(500).style("opacity", 0.0);
//   // d3.select(el).selectAll(".bgRect").transition().delay(500).remove();
//   // d3.select(el).select("text").transition().duration(500).style("opacity", 0.0);
// };
//
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

BridgesVisualizer.textMouseover = function(d,i) {

    if(!BridgesVisualizer.tooltipEnabled) return;

    var visType = BridgesVisualizer.assignmentTypes[$(this).closest("div").attr("id").substr(3)];
    // var offset = (BridgesVisualizer.textOffsets[visType]) ? BridgesVisualizer.textOffsets[visType] : BridgesVisualizer.textOffsets["default"];

    if(d3.select(this).select("rect") && visType != "tree")
        d3.select(this).select("rect").style("stroke", "#000").style("stroke-width", 5);

    if(d3.select(this).select("path")){
            d3.select(this).select("path").transition()
                .duration(750)
                .attr('d', function (d) {
                    return d3.svg.symbol().type(d.shape||"circle")
                            .size(BridgesVisualizer.scaleSize(40))();
                });

            if(visType != "tree"){
              d3.select(this).select("path").style("stroke", "yellow").style("stroke-width", 2);
            }
    };

    var textValueWithLineBreak = "";

    if(visType == "Array2D" || visType == "Array3D"){
        textValueWithLineBreak = "<h4>Node: "+ d3.select(this).select(".index-textview").text() +"</h4></br>" + d.name.replaceAll("\n","</br>");
    }else if(d.name.trim().length > 0){
        textValueWithLineBreak = "<h4>Node: "+i+"</h4></br>" + d.name.replaceAll("\n","</br>");
    }else{
        textValueWithLineBreak = "<h4>Node: "+i+"</h4></br> NULL";
    }


    div.transition()
        .duration(200)
        .style("opacity", 0.9);
    div	.html(textValueWithLineBreak)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");

    $(".tooltip").find("h4").css("background-color", BridgesVisualizer.getColor(d.color));
    if($(".tooltip").hasNoScrollBar()){
        $(".tooltip").css("pointer-events","none").css("border-radius","8px");
    }else{
        $(".tooltip").css("pointer-events","auto").css("border-radius","8px 0px 0px 8px");
    }

    textValueWithLineBreak = "";
};

BridgesVisualizer.textMouseout = function(d) {
    var visType = BridgesVisualizer.assignmentTypes[$(this).closest("div").attr("id").substr(3)];

    if(!BridgesVisualizer.tooltipEnabled) return;

    if(d3.select(this).select("rect"))
        d3.select(this).select("rect").style("stroke", "gray").style("stroke-width", 2);

    if(d3.select(this).select("path")){
            d3.select(this).select("path").transition()
                .duration(750)
                .attr('d', function (d) {
                    return d3.svg.symbol().type(d.shape||"circle")
                            .size(BridgesVisualizer.scaleSize(d.size||1))();
                });

                if(visType != "tree"){
                  d3.select(this).select("path").style("stroke", "").style("stroke-width", 0);
                }
    }

    if($(".tooltip").css("pointer-events") == "none"){
        $(".tooltip").html('');
        $(".tooltip").css("opacity","0").css("pointer-events","none");
    }
};

$(".tooltip").mouseout(function(){
    $(this).html('');
    $(this).css("opacity","0").css("pointer-events","none");
});


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


console.log(user);
console.log(data);
// console.log(JSON.stringify(data));
/* create new assignments  */
for (var key in data) {
  if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis" + key),
        width = ele.clientWidth - 15,
        height = ele.clientHeight + 15
        transform = data[key].transform;
    BridgesVisualizer.assignmentTypes.push(data[key]['visType']);

    if (data[key]['visType'] == "tree" && d3.bst) {
        bst = d3.bst(d3, "#vis" + key, width, height);
        bst.make(data[key]);
    }
    else if(data[key]['visType'] == "dllist" && d3.dllist){
        d3.dllist(d3, "#vis" + key, width, height, sortDoublyListByLinks(data[key]), transform);
    }
    else if(data[key]['visType'] == "cdllist" && d3.cdllist){
        d3.cdllist(d3, "#vis" + key, width, height, sortCircularDoublyListByLinks(data[key]), transform);
    }
    else if(data[key]['visType'] == "llist" && d3.sllist){
        d3.sllist(d3, "#vis" + key, width, height, sortDoublyListByLinks(data[key]), transform);;
    }
    else if(data[key]['visType'] == "cllist" && d3.csllist){
        d3.csllist(d3, "#vis" + key, width, height, sortCircularSinglyListByLinks(data[key]), transform);
    }
    else if (data[key]['visType'] == "queue" && d3.queue) {
        d3.queue(d3, "#vis" + key, width, height, data[key].nodes, transform);
    }
    else if (data[key]['visType'] == "Alist" && d3.array) {
          d3.array(d3, "#vis" + key, width, height, data[key].nodes, transform);
    }
    else if (data[key]['visType'] == "Array2D" && d3.array2d) {
          d3.array2d(d3, "#vis" + key, width, height, data[key].nodes, data[key].dims, transform);
    }
    else if (data[key]['visType'] == "Array3D" && d3.array3d) {
          d3.array3d(d3, "#vis" + key, width, height, data[key].nodes, data[key].dims, transform);
    }
    else if (data[key]['visType'] == "nodelink" && d3.graph) {
        BridgesVisualizer.setTicksPerRender(data[key].nodes.length);
        $("#savePosition").show();
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

function deleteAssignment(){
  $.ajax({
      url: "/assignments/"+assignmentNumber,
      type: "delete",
      data: {}
  }).done(function(status) {
      if(status == 'OK'){
          alertMessage("Scale and translation saved!<br>Taking you back to home...", "success");
          window.location.href="/username/"+user.username;
      } else {
          alertMessage("Unsuccessful. Try logging in!", "danger");
      }
  });
}

$('[data-toggle="popover"]').popover({
    trigger : 'click',
    placement : 'top',
    html: 'true',
    content : '',
    template: '<div class="popover"><div class="arrow"></div>'+
              '<h3 class="popover-title"></h3>'+
              '<div class="popover-footer"><button onclick="popoverSubmit()" type="button" class="btn btn-primary popover-submit">'+
              '<i class="glyphicon glyphicon-ok"></i></button>&nbsp;'+
              '<button type="button" onclick="popoverCancel()" class="btn btn-default popover-cancel">'+
              '<i class="glyphicon glyphicon-remove"></i></button></div></div>'
  });

  $('#submitDelete').click(function(){
      console.log($(".popover"));
      console.log($(".popover").css("opacity"));
      if($(".popover").css("opacity") == undefined){
          $('#submitDelete').click();
      }
  });
  //
  // $('[data-toggle="popover"]').click(function(){
  //
  //     console.log("click");
  //   $(this).show();
  // });

  function popoverSubmit(){
    console.log("click");
    deleteAssignment();
     $(".popover").popover('hide');
  }

  function popoverCancel(){
    console.log("click");
     $(".popover").popover('hide');
  }

//this methods sorts any Doubly Links linkedlist by links
function sortCircularSinglyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links,
        nodes = unsortedNodes.nodes,
        uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0,
        lastIndex;

    //O(n)
    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].source+"-"+links[i].target] = links[i];
        }
    }

    //this is expensive. Previous methods worked, but I find this way is safer.
    //but it only happens once
    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        if(a.split("-")[0] == b.split("-")[0]){
           if(parseInt(a.split("-")[1]) > parseInt(b.split("-")[1])){
              lastIndex = a;
           }else{
              lastIndex = b;
           }
        }
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });


    for(key in keys){
      nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
      sortedNodes.push(nodes[head]);
      head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
      sortedNodes.push(nodes[head]);
    }

    //this is O(1) since there is only one link from the last node to the first.
    for(key in uniqueBackwardLink){
      sortedNodes[sortedNodes.length-1]['forwardlink'] = uniqueBackwardLink[key];
    }

    return sortedNodes;
}

//this methods sorts any Doubly Links linkedlist by links
function sortCircularDoublyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links;
    var nodes = unsortedNodes.nodes;
    var uniqueForwardLink = {};
    var uniqueBackwardLink = {};
    var sortedNodes = [];
    var head = 0,
    lastIndex,
    lastElement;

    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].source+"-"+links[i].target] = links[i];
        }
    }

    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        if(a.split("-")[0] == b.split("-")[0]){
           if(parseInt(a.split("-")[1]) > parseInt(b.split("-")[1])){
              lastIndex = a;
           }else{
              lastIndex = b;
           }
        }
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });

    lastElement = keys.splice(lastIndex,1)[0];
    keys.push(lastElement);

    for(key in keys){
      nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
      sortedNodes.push(nodes[head]);
      head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
      sortedNodes.push(nodes[head]);
    }

    var backwardKeys = Object.keys(uniqueBackwardLink);
    for(key in backwardKeys){
        sortedNodes[uniqueBackwardLink[backwardKeys[key]].target]['backwardlink'] = uniqueBackwardLink[backwardKeys[key]];
    }
    sortedNodes[sortedNodes.length-1]['backwardlink'] = uniqueBackwardLink[sortedNodes.length-1+"-"+0];

    return sortedNodes;
}

//this methods sorts any Doubly Links linkedlist by links
function sortDoublyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links;
    var nodes = unsortedNodes.nodes;
    var uniqueForwardLink = {};
    var uniqueBackwardLink = {};
    var sortedNodes = [];
    var head = 0;

    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].target+"-"+links[i].source] = links[i];
        }
    }

    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });

    for(key in keys){
        nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
        sortedNodes.push(nodes[head]);
        head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
        sortedNodes.push(nodes[head]);
    }

    for(key in uniqueBackwardLink){
        if(sortedNodes[uniqueBackwardLink[key].target])sortedNodes[uniqueBackwardLink[key].target]['backwardlink'] = uniqueBackwardLink[key];
    }

    return sortedNodes;
}

// //this methods sorts any Doubly Links linkedlist by links and add the links inside the parent nodes
// //orignally the first node has be to be the head in order to work properly
// //but there is no need for that. Also, the time complexity is O(n)
// function sortNodesByLinks(unsortedNodes, listType){
//     var links = unsortedNodes.links, nodes = unsortedNodes.nodes, sortedNodes = [];
//     if(listType == "singly"){
//         for(var i = 0; i < links.length; i++){
//             if(!(links[i].source in sortedNodes)){
//                 if(nodes[links[i].source]) sortedNodes.insert(links[i].source, nodes[links[i].source]);
//                 if(sortedNodes[links[i].source]) sortedNodes[links[i].source]['forwardlink'] = links[i];
//             }
//         }
//     }else if(listType == "doubly"){
//         for(var i = 0; i < links.length; i++){
//             if(!(links[i].source in sortedNodes)){
//                 if(nodes[links[i].source]) sortedNodes.insert(links[i].source, nodes[links[i].source]);
//             }
//
//             if(links[i].source < links[i].target){
//                 if(sortedNodes[links[i].source]) sortedNodes[links[i].source]['forwardlink'] = links[i];
//             }else if(links[i].source > links[i].target){
//                 if(sortedNodes[links[i].source]) sortedNodes[links[i].target]['backwardlink'] = links[i];
//             }
//
//         }
//     }else if(listType == "cdoubly"){
//         console.log("as");
//         return sortDoublyLinkedCircularList(unsortedNodes);
//     }
//
//     return nodes;
// }
//
// //this methods sorts any Doubly Links linkedlist by links
// function sortDoublyLinkedCircularList(unsortedNodes){
//       var getTargetFromSource = {}, getLinkFromSource = {}, head, sortedNodes = [];
//       var links = unsortedNodes.links;
//       var nodes = unsortedNodes.nodes;
//       // console.log(typeof(nodes));
//
//       // var sortedNodes = new Array(nodes.length);
//       // console.log("nodesLe: " + nodes.length);
//       // sortedNodes[nodes.length] = undefined;
//       // var sortedNodes = new Array(Object.keys(nodes).length-1);
//
//       for(var i = 0; i < links.length; i++){
//         // getTargetFromSource[links[i].source] = links[i].target;//assigning the link source as the key and the target as the value
//             getTargetFromSource[links[i].target] = links[i].source;//assigning the link source as the key and the target as the value
//             getLinkFromSource[links[i].source+"-"+links[i].target] = links[i];//creating a unique identifier for every link
//           }
//
//           head = 0;
//           for(var i = 0; i < nodes.length; i++){
//             var key = getTargetFromSource[head] + "-" + head;//link from target to source
//             var yek = head + "-" + getTargetFromSource[head];//link from source to target
//             if(getLinkFromSource[key]) {
//               if(sortedNodes[head] != undefined){
//                 sortedNodes[head]['backwardlink'] = getLinkFromSource[key];//if there is a link, insert in the nodes
//               }else{
//                 nodes[head]['backwardlink'] = getLinkFromSource[key];
//                 sortedNodes.insert(head,nodes[head]);
//               }
//             }
//             if(getLinkFromSource[yek]){
//               if(sortedNodes[head] != undefined){
//                 sortedNodes[head]['forwardlink'] = getLinkFromSource[yek];//if there is a link, insert in the nodes
//               }else{
//                 nodes[head]['forwardlink'] = getLinkFromSource[yek];
//                 sortedNodes.insert(head,nodes[head]);
//               }
//             // if(nodes[head])sortedNodes.push(nodes[head]);
//             head = getTargetFromSource[head];//getting the next target
//             // if(!head)break;
//           }
//         }
//
//
//     return sortedNodes;
// }

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

    } catch(err){
      console.log(err);
    }
}

// Save cookies when scale and translation are updated
// only updates zoom after scrolling has stopped
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

//toggle, show and hide all labels ".nodeLabel"
$("body").on("keydown", function(event) {
    if(event.which == "76"){
        $(".tooltip").mouseout();
        if(d3.selectAll(".nodeLabel").style("display") == "none" || d3.selectAll(".nodeLabel").style("opacity") == "0"){
            d3.selectAll(".nodeLabel").style("display","block").style("opacity","1");
            BridgesVisualizer.tooltipEnabled = false;
        }else {
            d3.selectAll(".nodeLabel").style("display","none").style("opacity","0");
            BridgesVisualizer.tooltipEnabled = true;
        }
    }
});

//close tooltip on double click
$("body").dblclick(function(){
    $(".tooltip").mouseout();
});
