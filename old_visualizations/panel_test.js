// checks if key is Record
function isRecord(key) {
  return key.includes('UiApi::RecordRepresentation') && !key.includes('__fields__');
}

// recursive function that builds Tree JSON object
function makeTreeJSON(key, recs, tree) {
  let obj = {'name':key};
  if (!(key in recs)) {
    console.log('key not in recs');
    console.log(key);
  }
  if (!('fields' in recs[key]) && (recs[key]['value'] === null || typeof(recs[key]['value'])!=='object')) { // is a leaf
    console.log('obj '+key);
    console.log(obj);
    return obj;
  }

  obj['children'] = [];

  // must be field
  if (!('fields' in recs[key])) {
    // special check for child Record
    let ref = recs[key]['value']['__ref']
    ref_obj = makeTreeJSON(ref, recs, tree);
    obj['children'].push(ref_obj);
    return obj;
  }

  let fields = recs[key]['fields'];
  for (field in fields) {
    // if (field == '__proto__') {
    //   continue;
    // }

    let ref = fields[field]['__ref'];
    console.log('field ref '+field+' '+ref);
    ref_obj = makeTreeJSON(ref, recs, tree);
    console.log('ref obj');
    console.log(ref_obj);
    obj['children'].push(ref_obj);
  }
  //
  // console.log('key '+key);
  // console.log(obj);
  console.log('obj '+key);
  console.log(obj);
  return obj;
}

// format Response JSON to pass into makeTreeJSON
function formatResponse(response) {
  let parentArray = []; // child - parent relationship
  let recordsArray = []; // keeps track of all Records
  let recs;
  let original_names = {}; // for names that had () replaced
  let isRoot = {};

  let tree = {};

  if (response.source && response.source.records) {
    recs = response.source.records;// response.source.records;
    console.log('recs');
    console.log(recs);

    for (key in recs) {

      // is a field Record
      if (key.includes('__fields__') && recs[key]['value'] !== null && typeof(recs[key]['value']) == 'object' && ('__ref' in recs[key]['value'])) {
        let ref = recs[key]['value']['__ref']
        if (isRecord(ref)) {
          isRoot[ref] = false;
        }
      }
      // if (key.slice(-3) == '__r') {
      //   key_rec = key.substring(0, key.indexOf('__fields__')); // text before __fields__
      //   // console.log('slice');
      //   // console.log(key.slice(-3));
      //   // console.log(key_rec);
      //   isRoot[key_rec] = false;
      //   // special check for child Record
      //   let ref = recs[key]['value']['__ref']
      //   if (isRecord(ref)) {
      //     isRoot[ref] = false;
      //   }
      //
      // }
      else if (isRecord(key)) {
        // insert into recordsArray
        // if (!(key in recordsArray)) {
        //   recordsArray.push(key);
        // }
        if (!(key in isRoot)) {
          isRoot[key] = true;
          console.log('true key');
          console.log(key);
        }
        // get all fields
        if (recs[key]['fields']) {
          let fields = recs[key]['fields'];
          for (field in fields) {
            let ref = fields[field]['__ref'];
            if (isRecord(ref)) {
              isRoot[ref] = false;
            }
            // let ref = fields[field]['__ref']; // assuming is a __fields__?
            // // () can't exist, replace them
            // // if (ref.includes('(') || ref.includes(')')) {
            // //   let orig = ref;
            // //   ref = ref.replace('(', '_');
            // //   ref = ref.replace(')', '_');
            // //   original_names[ref] = orig;
            // // }
            // // add ref + parent to parent array
            // if (ref in parentArray) {
            //   parentArray[ref].push(key);
            // } else {
            //   parentArray[ref] = [key];
            // }
          }
        }
      }
    }

    // get root and root children
    let root = 'root';

    recs[root] = {"apiName": "root","fields":{}};
    for (key in isRoot) {
      if (isRoot[key]) {
        recs[root]['fields'][key] = {'__ref':key};
      }
    }
    // console.log('roots');
    // console.log(isRoot);
    // console.log('recs');
    // console.log(recs);
    return recs;

    // tree['name'] = root;
    // tree['children'] = [];
    // for (key in isRoot) {
    //   if (isRoot[key]) {
    //     tree['children'].push(key);
    //   }
    // }
  }
  //
  //
  //
  // console.log('parentArray');
  // console.log(parentArray);
  // // graph structure
  // let grafo = [];
  // for (key in parentArray) {
  //   let newVal = {};
  //   newVal['id'] = key;
  //   newVal['parentIds'] = parentArray[key];
  //   grafo.push(newVal);
  // }
  // console.log('records');
  // console.log(recordsArray);
  //
  // // for now, DAG has to be connected
  // if (recordsArray.length == 1) {
  //   grafo.push({'id':recordsArray[0], 'parentIds':[]});
  // } else {
  //   let root = 'root';
  //   for (let i = 0; i < recordsArray.length; i++) {
  //     grafo.push({'id':recordsArray[i], 'parentIds':[root]});
  //   }
  //   grafo.push({'id':root, 'parentIds':[]});
  // }
  // console.log('grafo');
  // console.log(grafo);
}





function buildTree(treeData, recs) {
  d3.selectAll("div > *").remove();
//
// recs = {
//   "UiApi::RecordRepresentation:a03RM0000004t2LYAQ__fields__TestC__c": {
//     "displayValue": null,
//     "value": "a02RM00000081S9YAI"
//   },
//   "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__Id": {
//     "displayValue": null,
//     "value": "a02RM00000081S9YAI"
//   },
//   "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__TestA__c": {
//     "displayValue": null,
//     "value": "a00RM0000008EhHYAU"
//   },
//   "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Id": {
//     "displayValue": null,
//     "value": "a00RM0000008EhHYAU"
//   },
//   "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Opportunity__c": {
//     "displayValue": null,
//     "value": "006RM000003JZMkYAO"
//   },
//   "UiApi::RecordRepresentation:001RM000004XMZ5YAO__fields__Id": {
//     "displayValue": null,
//     "value": "001RM000004XMZ5YAO"
//   },
//   "UiApi::RecordRepresentation:001RM000004XMZ5YAO__fields__Name": {
//     "displayValue": null,
//     "value": "foo"
//   },
//   "UiApi::RecordRepresentation:001RM000004XMZ5YAO": {
//     "apiName": "Account",
//     "childRelationships": {},
//     "eTag": "c878d41afe69814acb5779048dbe82e5",
//     "fields": {
//       "Id": {
//         "__ref": "UiApi::RecordRepresentation:001RM000004XMZ5YAO__fields__Id"
//       },
//       "Name": {
//         "__ref": "UiApi::RecordRepresentation:001RM000004XMZ5YAO__fields__Name"
//       }
//     },
//     "id": "001RM000004XMZ5YAO",
//     "lastModifiedById": "005RM000001stMBYAY",
//     "lastModifiedDate": "2019-10-24T18:59:40.000Z",
//     "recordTypeId": "012RM000000DBJDYA4",
//     "recordTypeInfo": null,
//     "systemModstamp": "2019-10-24T18:59:41.000Z",
//     "weakEtag": 1571943581000
//   },
//   "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__Account": {
//     "displayValue": "foo",
//     "value": {
//       "__ref": "UiApi::RecordRepresentation:001RM000004XMZ5YAO"
//     }
//   },
//   "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__AccountId": {
//     "displayValue": null,
//     "value": "001RM000004XMZ5YAO"
//   },
//   "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__Id": {
//     "displayValue": null,
//     "value": "006RM000003JZMkYAO"
//   },
//   "UiApi::RecordRepresentation:006RM000003JZMkYAO": {
//     "apiName": "Opportunity",
//     "childRelationships": {},
//     "eTag": "0fc239e0dcc4ffb2f81e96b28568aa53",
//     "fields": {
//       "Account": {
//         "__ref": "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__Account"
//       },
//       "AccountId": {
//         "__ref": "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__AccountId"
//       },
//       "Id": {
//         "__ref": "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__Id"
//       }
//     },
//     "id": "006RM000003JZMkYAO",
//     "lastModifiedById": null,
//     "lastModifiedDate": null,
//     "recordTypeId": "012RM000000DBJIYA4",
//     "recordTypeInfo": null,
//     "systemModstamp": null,
//     "weakEtag": 0
//   },
//   "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Opportunity__r": {
//     "displayValue": null,
//     "value": {
//       "__ref": "UiApi::RecordRepresentation:006RM000003JZMkYAO"
//     }
//   },
//   "UiApi::RecordRepresentation:a00RM0000008EhHYAU": {
//     "apiName": "TestA__c",
//     "childRelationships": {},
//     "eTag": "90e408b0a1b6595946d45e753070444a",
//     "fields": {
//       "Id": {
//         "__ref": "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Id"
//       },
//       "Opportunity__c": {
//         "__ref": "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Opportunity__c"
//       },
//       "Opportunity__r": {
//         "__ref": "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Opportunity__r"
//       }
//     },
//     "id": "a00RM0000008EhHYAU",
//     "lastModifiedById": null,
//     "lastModifiedDate": null,
//     "recordTypeId": "012RM000000DBJ3YAO",
//     "recordTypeInfo": null,
//     "systemModstamp": null,
//     "weakEtag": 0
//   },
//   "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__TestA__r": {
//     "displayValue": null,
//     "value": {
//       "__ref": "UiApi::RecordRepresentation:a00RM0000008EhHYAU"
//     }
//   },
//   "UiApi::RecordRepresentation:a02RM00000081S9YAI": {
//     "apiName": "TestC__c",
//     "childRelationships": {},
//     "eTag": "612a7b93f6d8d1ca725c6d0b2e05e99f",
//     "fields": {
//       "Id": {
//         "__ref": "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__Id"
//       },
//       "TestA__c": {
//         "__ref": "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__TestA__c"
//       },
//       "TestA__r": {
//         "__ref": "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__TestA__r"
//       }
//     },
//     "id": "a02RM00000081S9YAI",
//     "lastModifiedById": "005RM000001stMBYAY",
//     "lastModifiedDate": "2019-10-24T20:20:31.000Z",
//     "recordTypeId": "012000000000000AAA",
//     "recordTypeInfo": null,
//     "systemModstamp": "2019-10-24T20:20:31.000Z",
//     "weakEtag": 1571948431000
//   },
//   "UiApi::RecordRepresentation:a03RM0000004t2LYAQ__fields__TestC__r": {
//     "displayValue": null,
//     "value": {
//       "__ref": "UiApi::RecordRepresentation:a02RM00000081S9YAI"
//     }
//   },
//   "UiApi::RecordRepresentation:a03RM0000004t2LYAQ": {
//     "apiName": "TestD__c",
//     "childRelationships": {},
//     "eTag": "37ecc5400ba0a5fc5eb8f5209a3ca43a",
//     "fields": {
//       "TestC__c": {
//         "__ref": "UiApi::RecordRepresentation:a03RM0000004t2LYAQ__fields__TestC__c"
//       },
//       "TestC__r": {
//         "__ref": "UiApi::RecordRepresentation:a03RM0000004t2LYAQ__fields__TestC__r"
//       }
//     },
//     "id": "a03RM0000004t2LYAQ",
//     "lastModifiedById": "005RM000001stMBYAY",
//     "lastModifiedDate": "2019-10-24T21:45:31.000Z",
//     "recordTypeId": "012000000000000AAA",
//     "recordTypeInfo": null,
//     "systemModstamp": "2019-10-24T21:45:31.000Z",
//     "weakEtag": 1571953531000
//   }
// };
//
// treeData = {
//   "name": "root",
//   "children": [
//     {
//       "name": "UiApi::RecordRepresentation:a03RM0000004t2LYAQ",
//       "children": [
//         {
//           "name": "UiApi::RecordRepresentation:a03RM0000004t2LYAQ__fields__TestC__c"
//         },
//         {
//           "name": "UiApi::RecordRepresentation:a03RM0000004t2LYAQ__fields__TestC__r",
//           "children": [
//             {
//               "name": "UiApi::RecordRepresentation:a02RM00000081S9YAI",
//               "children": [
//                 {
//                   "name": "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__Id"
//                 },
//                 {
//                   "name": "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__TestA__c"
//                 },
//                 {
//                   "name": "UiApi::RecordRepresentation:a02RM00000081S9YAI__fields__TestA__r",
//                   "children": [
//                     {
//                       "name": "UiApi::RecordRepresentation:a00RM0000008EhHYAU",
//                       "children": [
//                         {
//                           "name": "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Id"
//                         },
//                         {
//                           "name": "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Opportunity__c"
//                         },
//                         {
//                           "name": "UiApi::RecordRepresentation:a00RM0000008EhHYAU__fields__Opportunity__r",
//                           "children": [
//                             {
//                               "name": "UiApi::RecordRepresentation:006RM000003JZMkYAO",
//                               "children": [
//                                 {
//                                   "name": "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__Account",
//                                   "children": [
//                                     {
//                                       "name": "UiApi::RecordRepresentation:001RM000004XMZ5YAO",
//                                       "children": [
//                                         {
//                                           "name": "UiApi::RecordRepresentation:001RM000004XMZ5YAO__fields__Id"
//                                         },
//                                         {
//                                           "name": "UiApi::RecordRepresentation:001RM000004XMZ5YAO__fields__Name"
//                                         }
//                                       ]
//                                     }
//                                   ]
//                                 },
//                                 {
//                                   "name": "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__AccountId"
//                                 },
//                                 {
//                                   "name": "UiApi::RecordRepresentation:006RM000003JZMkYAO__fields__Id"
//                                 }
//                               ]
//                             }
//                           ]
//                         }
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// };

function getText(key, recs) {
  if (key == 'root') {
    return 'root';
  }
  if (!key.includes('__fields__')) { //is Record
    return recs[key]['apiName'] ?? key;
  }
  if (key.slice(-3) == '__r') {
    return key.substring(key.indexOf('__fields__') + '__fields__'.length, key.length - 3);
  }
  return key.substring(key.indexOf('__fields__') + '__fields__'.length);
}

function getValue(key, recs) {
  if (key == 'root') {
    return 'root';
  }
  if (!key.includes('__fields__')) { //is Record
    return key.substring('UiApi::RecordRepresentation:'.length);
  }
  if (key.slice(-3) == '__r') {
    return key.substring('UiApi::RecordRepresentation:'.length, key.length - 3);
  }

  if (recs[key]['displayValue'] === null) {
    return recs[key]['value'] ?? key;
  }
  return recs[key]['displayValue'];
}

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(getText(d.name, recs).length, maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
            if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            nodePaths = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id;
                }).filter(function(d, i) {
                    if (d.id == draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
        svgGroup.selectAll('path.link').filter(function(d, i) {
            if (d.target.id == draggingNode.id) {
                return true;
            }
            return false;
        }).remove();

        dragStarted = null;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        //.attr("class", "overlay")
        .call(zoomListener);


    // Define the drag listeners for drag/drop behaviour of nodes.
    dragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function(d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            // get coords of mouseEvent relative to svg container to allow for panning
            relCoords = d3.mouse($('svg').get(0));
            if (relCoords[0] < panBoundary) {
                panTimer = true;
                pan(this, 'left');
            } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                panTimer = true;
                pan(this, 'right');
            } else if (relCoords[1] < panBoundary) {
                panTimer = true;
                pan(this, 'up');
            } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                panTimer = true;
                pan(this, 'down');
            } else {
                try {
                    clearTimeout(panTimer);
                } catch (e) {

                }
            }

            d.x0 += d3.event.dy;
            d.y0 += d3.event.dx;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            updateTempConnector();
        }).on("dragend", function(d) {
            if (d == root) {
                return;
            }
            domNode = this;
            if (selectedNode) {
                // now remove the element from the parent, and insert it into the new elements children
                var index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    draggingNode.parent.children.splice(index, 1);
                }
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    if (typeof selectedNode.children !== 'undefined') {
                        selectedNode.children.push(draggingNode);
                    } else {
                        selectedNode._children.push(draggingNode);
                    }
                } else {
                    selectedNode.children = [];
                    selectedNode.children.push(draggingNode);
                }
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                expand(selectedNode);
                sortTree();
                endDrag();
            } else {
                endDrag();
            }
        });

    function endDrag() {
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        if (draggingNode !== null) {
            update(root);
            centerNode(draggingNode);
            draggingNode = null;
        }
    }

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0,
                    y: selectedNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 4;//2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d);
        centerNode(d);
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 7)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            //.call(dragListener)
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });
            // adds hover

        var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
        nodeEnter.on('mouseover', function (d, i) {
                  d3.select(this).transition()
                       .duration('50')
                       .attr('opacity', '.7');

                   div.transition()
                        .duration(50)
                        .style("opacity", 1);
                  div.html(getValue(d.name, recs))
                       .style("left", (d3.event.pageX-10) +"px")
                       .style("top", (d3.event.pageY+10) + "px");

                      })
             .on('mouseout', function (d, i) {
                  d3.select(this).transition()
                       .duration('50')
                       .attr('opacity', '1');
                   div.transition()
                        .duration('50')
                        .style("opacity", 0);
                      });
        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return getText(d.name, recs);
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return getText(d.name, recs);
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);
}







// stores tabId that opened this devtools window
let tabId = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('got message');
  if (request.tabId == tabId && request.action == 'giveSource') {
    console.log('giveSource');
    console.log(tabId);
    console.log(JSON.stringify(request));
    newTree = {};
    new_recs = formatResponse(request);
    console.log('new recs');
    console.log(new_recs);
    treeData = makeTreeJSON('root', new_recs, newTree);
    console.log(treeData);
    buildTree(treeData, new_recs);
  }

});

//
chrome.runtime.sendMessage({action: 'getSource'}, function(response) {
  // format response to be put in sugiyama-DAG
  alert('getSource devtools');
  alert(response.tabId);
  tabId = response.tabId;
  newTree = {};
  new_recs = formatResponse(response);
  console.log('new recs');
  console.log(new_recs);
  treeData = makeTreeJSON('root', new_recs, newTree);
  console.log(treeData);
  buildTree(treeData, new_recs);


});
