
// This module accepts the vistype sent by the client
//    and returns the appropriate visualization type to display
exports.getVisType = function(toCheck) {
  var validTypes = {
        "ALIST":            "Alist",
        "Array":            "Alist",
        "Array_Stack":      "Alist",
        "Array_Queue":      "Alist",
        "LinkedListStack":  "nodelink",
        "LinkedListQueue":  "nodelink",

        "SinglyLinkedList": "llist",
        "llist":            "llist",
        "DoublyLinkedList": "dllist",
        "dllist":           "dllist",
        "CircularSinglyLinkedList": "cllist",
        "CircularDoublyLinkedList": "cdllist",

        "tree":             "tree",
        "Tree":             "tree",
        "BinaryTree":       "tree",
        "BinarySearchTree": "tree",
        "AVLTree":          "tree",

        "GraphAdjacencyList":   "nodelink",
        "GraphAdjacencyMatrix": "nodelink"
    };
    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else if( toCheck && validTypes[toCheck.toString().toUpperCase()] )
      return validTypes[toCheck.toString().toUpperCase()];
    else
        return "nodelink";
};

function doSomething(data, vistype){
      var finalVistype;

      if(data.visual){
          finalVistype = visTypes.getVisType(data.visual);
      } else { // hierarchical tree representation does not have data.visual
          finalVistype = visTypes.getVisType(vistype);
      }

      if(finalVistype == "Alist" && data.dims){
          finalVistype = visTypes.getArrayType(data.dims)
      }

      return finalVistype;
}

exports.getVisTypeObject = function(dataVisual, dataVistype) {
  var validTypes = {
      "nodelink":   {"vistype":"nodelink",   "script":"/js/graph.js",          "link":""                  	},
          "tree":   {"vistype":"tree",       "script":"/js/tree/lib/bst.js",   "link":"/css/vis/tree.css" 	},
         "queue":   {"vistype":"queue",      "script":"/js/queue.js",          "link":""                  	},
         "Alist":   {"vistype":"Alist",      "script":"/js/array/array.js",    "link":""						        },
       "Array2D":   {"vistype":"Array2D",    "script":"/js/array/array2d.js",  "link":""					         	},
       "Array3D":   {"vistype":"Array3D",    "script":"/js/array/array3d.js",  "link":""					         	},
         "llist":   {"vistype":"llist",      "script":"/js/list/llist.js",     "link":""				        		},
        "dllist":   {"vistype":"dllist",     "script":"/js/list/dllist.js",    "link":""				        		},
        "cllist":   {"vistype":"cllist",     "script":"/js/list/cllist.js",    "link":""				        		},
       "cdllist":   {"vistype":"cdllist",    "script":"/js/list/cdllist.js",   "link":""				        		}
    };

    var toCheck = doSomething(dataVisual, dataVistype.vistype)

    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else
        return {"vistype":"nodelink",   "script":"/js/graph.js",          "link":""                  	};
};


exports.getArrayType = function(dims){
      if(dims){
          if(parseInt(dims[1]) > 1 && parseInt(dims[2]) == 1){
              return "Array2D";
          }else if(parseInt(dims[1]) > 1 && parseInt(dims[2]) > 1){
              return "Array3D";
          }else{
              return "Alist";
          }
      }
      return "Alist"
}
