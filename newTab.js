chrome.runtime.sendMessage({action: 'getSource'}, function(response) {
  grafo = response.source;
  alert(grafo);
  const dag = d3.dagStratify()(grafo)

  d3.sugiyama()(dag);

  const links = dag.links()
  const descendants = dag.descendants();

  const width = 400;
  const height = 400;

  const steps = dag.size();
  const interp = d3.interpolateRainbow;
  const colorMap = {};
  dag.each((node, i) => {
    colorMap[node.id] = interp(i / steps);
  });
  const nodeRadius=20;
  const svgSelection = d3.select('svg');

  const line = d3.line()
    .curve(d3.curveCatmullRom)
    .x(d => d.x * width)
    .y(d => d.y * height);

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

  const nodes = g.append('g')
    .selectAll('g')
    .data(descendants)
    .enter()
    .append('g')
    .attr('transform', ({
      x,
      y
    }) => `translate(${x*width}, ${y*height})`);

  nodes.append('circle')
    .attr('r', 20)
    .attr('fill', n => colorMap[n.id]);
    //.attr('stroke', 'black');


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

  // Add text
  nodes.append('text')
    .text(d => d.id)
    .attr('font-weight', 'bold')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white');



});
