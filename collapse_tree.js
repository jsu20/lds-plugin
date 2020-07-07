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
}
// newTree = {};
// new_recs = formatResponse(treeData);
// treeData = makeTreeJSON('root', new_recs, newTree);
// console.log(newTree);

//
// var treeData =
//   {
//     "name": "Top Level",
//     "children": [
//       {
//         "name": "Level 2: A",
//         "children": [
//           { "name": "Son of A" },
//           { "name": "Daughter of A" }
//         ]
//       },
//       { "name": "Level 2: B" }
//     ]
//   };


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


function createCollapsibleTree(treeData, recs) {
  d3.selectAll("body > *").remove();

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
width = 2000;
// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return getText(d.data.name, recs); });
    //
    // var div = d3.select("body").append("div")
    // .attr("class", "tooltip")
    // .style("opacity", 0);
    nodeEnter.on('mouseover', function (d, i) {
              d3.select(this).transition()
                   .duration('50')
                   .attr('opacity', '.7');
              //
              //  div.transition()
              //       .duration(50)
              //       .style("opacity", 1);
              // div.html(getValue(d.data.name, recs))
              //      .style("left", (d3.event.pageX-10) +"px")
              //      .style("top", (d3.event.pageY+10) + "px");

                  })
         .on('mouseout', function (d, i) {
              d3.select(this).transition()
                   .duration('50')
                   .attr('opacity', '1');
               // div.transition()
               //      .duration('50')
               //      .style("opacity", 0);
                   });
  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}
}
// createCollapsibleTree(treeData);





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
    createCollapsibleTree(treeData, new_recs);
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
  createCollapsibleTree(treeData, new_recs);


});
