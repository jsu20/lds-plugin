chrome.runtime.sendMessage({action: 'getSource'}, function(response) {
  // format response to be put in sugiyama-DAG
  let parentArray = []; // child - parent relationship
  let recordsArray = []; // keeps track of all Records
  let recs;
  if (response.source && response.source.records) {
    recs = response.source.records;
    for (key in recs) {
      // check if key is RecordRepresentation, not field
      if (key.includes('UiApi::RecordRepresentation') && !key.includes('__fields__' )) {
        // insert into recordsArray
        if (!(key in recordsArray)) {
          recordsArray.push(key);
        }
        // get all fields
        if (recs[key]['fields']) {
          let fields = recs[key]['fields'];
          for (field in fields) {
            let ref = fields[field]['__ref'];
            // () can't exist, replace them
            ref = ref.replace('(', '_');
            ref = ref.replace(')', '_');
            // add ref + parent to parent array
            if (ref in parentArray) {
              parentArray[ref].push(key);
            } else {
              parentArray[ref] = [key];
            }
          }
        }
      }
    }
  }

  console.log('parentArray');
  console.log(parentArray);
  // graph structure
  let grafo = [];
  for (key in parentArray) {
    let newVal = {};
    newVal['id'] = key;
    newVal['parentIds'] = parentArray[key];
    grafo.push(newVal);
  }
  console.log('records');
  console.log(recordsArray);

  console.log('grafo');
  console.log(JSON.stringify(grafo));

  // for now, DAG has to be connected
  if (recordsArray.length == 1) {
    grafo.push({'id':recordsArray[0], 'parentIds':[]});
  } else {
    let root = 'root';
    for (let i = 0; i < recordsArray.length; i++) {
      grafo.push({'id':recordsArray[i], 'parentIds':[root]});
    }
    grafo.push({'id':root, 'parentIds':[]});
  }
  console.log(grafo);

  const dag = d3.dagStratify()(grafo)

  d3.sugiyama()(dag);

  const links = dag.links()
  const descendants = dag.descendants();

  const width = 4000;
  const height = 800;

  const steps = dag.size();
  const interp = d3.interpolateRainbow;
  const colorMap = {};
  dag.each((node, i) => {
    colorMap[node.id] = interp(i / steps);
  });
  const nodeRadius = 20;
  const svgSelection = d3.select('svg');

  const line = d3.line()
    .curve(d3.curveCatmullRom)
    .x(d => d.x * width)
    .y(d => d.y * height)

  const g = svgSelection.append('g').attr('transform', `translate(${100},${100})`)
  const defs = g.append('defs'); // For gradients
  g.append('g')
    .selectAll('path')
    .data(dag.links())
    .enter()
    .append('path')
    .attr('d', ({ data }) => line(data.points))
    .attr('fill', 'none')
    .attr('stroke-width', 3)
    .attr('stroke', ({source, target}) => {
      const gradId = `${source.id}-${target.id}`;
      const grad = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', width*source.x)
        .attr('x2', width*target.x)
        .attr('y1', height*source.y)
        .attr('y2', height*target.y);
      grad.append('stop').attr('offset', '0%').attr('stop-color', colorMap[source.id]);
      grad.append('stop').attr('offset', '100%').attr('stop-color', colorMap[target.id]);
      return `url(#${gradId})`;
    });

  // location for displayed value on hover
  var div = d3.select("div").append("div")
       .attr("class", "tooltip-donut")
       .style("opacity", 0);
  // get value to display on hover
  function getValue(key) {
    if (key.includes('__fields__' )) {
      if (recs[key]['displayValue'] === null) {
        return recs[key]['value'];
      }
      return recs[key]['displayValue'];
    } else if (key.includes('RecordRepresentation')) {
      return 'eTag: ' + recs[key]['eTag'];
    } else {
      return key;
    }
  }
  const nodes = g.append('g')
    .selectAll('g')
    .data(descendants)
    .enter()
    .append('g')
    .attr('transform', ({
      x,
      y
    }) => `translate(${x*width}, ${y*height})`)
    // adds hover
    .on('mouseover', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '.7');

           div.transition()
                .duration(50)
                .style("opacity", 1);
          div.html(getValue(d.id))
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 15) + "px");

              })
     .on('mouseout', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '1');
           div.transition()
                .duration('50')
                .style("opacity", 0);
              });


  // nodes.append('circle')
  //   .attr('r', 20)
  //   .attr('fill', n => colorMap[n.id]);
  // added ellipse around nodes
  nodes.append('ellipse')
        .attr('rx', n => 4 * getText(n.id).length)
        .attr('ry', 15)
        .attr('fill', n => colorMap[n.id]);


  // Generate arrows
  const arrow = d3.symbol().type(d3.symbolTriangle).size(nodeRadius * nodeRadius / 5.0);
  g.append('g')
    .selectAll('path')
    .data(dag.links())
    .enter()
    .append('path')
    .attr('d', arrow)
    .attr('transform', ({
      source,
      target,
      data
    }) => {
      const [end, start] = data.points.reverse();
      console.log([end, start]);
      // This sets the arrows the node radius (20) + a little bit (3) away from the node center, on the last line segment of the edge. This means that edges that only span ine level will work perfectly, but if the edge bends, this will be a little off.
      const dx = width * (start.x - end.x);
      const dy = height * (start.y - end.y);
      const scale = nodeRadius * 1.15 / Math.sqrt(dx * dx + dy * dy);
      // This is the angle of the last line segment
      const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;
      console.log(angle, dx, dy);
      return `translate(${width * end.x + dx * scale}, ${height * end.y + dy * scale}) rotate(${angle})`;
    })
    .attr('fill', ({target}) => colorMap[target.id])
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5);

  // get text to put inside node
  function getText(key) {
    if (key.indexOf('__fields__') > -1) {
      // get substring after __fields__
      return key.substring(key.indexOf('__fields__') + ('__fields__'.length));
    } else if (key.includes('RecordRepresentation')) {
      return recs[key]['apiName'];
    } else {
      return key;
    }
  }
  // Add text
  nodes.append('text')
    .text(d => getText(d.id))
    .attr('font-weight', 'bold')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white');



});
