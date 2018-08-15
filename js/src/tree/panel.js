

import * as d3 from 'd3';
import './panel.css';

let DEFAULT_WIDTH = 800;
let DEFAULT_HEIGHT = 500;

export default function Panel() {
  let margin = {top: 10, right: 30, bottom: 50, left:60},
  width = DEFAULT_WIDTH - margin.left - margin.right,
  height = DEFAULT_HEIGHT - margin.top - margin.bottom;

  let svg = null;
  let root = null;
  let nodes = [];
  let field = null;
  let attrs = {};

  let selected = null;

  // let cmap = ['thistle', 'lightyellow', 'lightgreen'];
  let cmap = ['white', 'lightgreen'];
  let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain([0, 1]).clamp(true);

  let x_type = 'linear';
  let y_type = 'linear';

  let sx = d3.scaleLinear().domain([0, 1]).range([0, width]).clamp(true);
  let sy = d3.scaleLinear().domain([Number.EPSILON, 1]).range([height, 0]).clamp(true);

  let y_axis = d3.axisLeft(sy).ticks(4, '.1e');
  let x_axis = d3.axisBottom(sx).ticks(8, 's');

  let dispatch = d3.dispatch('highlight', 'select', 'details');

  function flatten(node, arr){
    arr.push(node);
    for (let child of node.children) {
      flatten(child, arr)
    }
    return arr;
  }

  function preprocess() {
    selected = null
    if (!root) return;
    nodes = flatten(root, []);
    sx.domain([0, root.size]);
  }

  function layout() {
    if (!root) return;
    visit(root, [0, root.size]);

    function visit(node, range) {
      let w = range[1] - range[0];
      // node.pos = {x: range[0], y: node.lvl, w: w, yp: node.parent && node.parent.lvl || 1};
      node.pos = {x: node.offset, y: node.lvl, w: node.size, yp: node.parent && node.parent.lvl || 1};
      let from = range[0];
      for (let child of node.children) {
        let to = from + child.size; // w * child.size / node.size;
        visit(child, [from, to]);
        from = to;
      }
    }
  }

  function render() {
    if (!svg || !root) return;

    svg.select('.x').call(x_axis);
    svg.select('.y').call(y_axis);

    let d3nodes = svg.select('.nodes').selectAll('.node')
      .data(nodes, d => d.id);

    d3nodes.enter()
    .append('rect')
      .attr('class', 'node')
      // .on('mouseenter', d => hover(d, true))
      // .on('mouseleave', d => hover(d, false))
      // .on('click', ensure_single(details))
      // .on('dblclick', select)
    .merge(d3nodes)
      .attr('x', d => sx(d.pos.x))
      .attr('y', d => sy(d.pos.yp))
      .attr('width', d => Math.max(1, sx(d.pos.x + d.pos.w) - sx(d.pos.x)-1))
      .attr('height', d => Math.max(0, sy(d.pos.y) - sy(d.pos.yp)-1))
      .style('fill', d =>
        {//console.log(d[field], colorScale(d[field]));
          if (!field) return 'white';
          let value = field in d ? d[field]: field in attrs ? attrs[field][d.id] : null;
          return value != null && colorScale(value) || 'white';
        })
      // .classed('highlight', d => d.highlight)
      // .classed('selected', d => d.selected)
      // .classed('details', d => d.details);
      ;

    d3nodes.exit().remove();
  }

  let panel = {

    el(_) {
      // svg = d3.select(_);
      svg = _;

      let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      g.append('g')
        .attr('class', 'nodes');

      g.append('g')
        .attr('class', 'names');

      g.append('g')
        .attr('class', 'x axis')
        .append('text')
          .attr('class', 'axis-label')
          .style('text-anchor', 'middle')
          .text('Points');

      g.append('g')
        .attr('class', 'y axis')
        .append('text')
          .attr('class', 'axis-label')
          .attr('transform', 'rotate(-90)')

          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('Persistence');
      return this;
    },

    resize() {
      if (!svg) return;

      let w = parseInt(svg.style('width')) || DEFAULT_WIDTH;
      let h = parseInt(svg.style('height')) || DEFAULT_HEIGHT;
      width =  w -margin.left - margin.right;
      height = h - margin.top - margin.bottom ;

      svg.select('.x')
       .attr('transform', `translate(0,${height})`)
       .select('text')
       .attr('transform', `translate(${width/2},${margin.top + 20})`);

      svg.select('.y text')
       .attr('y', 0 - margin.left)
       .attr('x',0 - (height / 2));

       sx.range([0, width]);
       sy.range([height, 0]);

       render();
       return this;
    },

    field(_) {
      field = _;
      render();
      return this;
    },

    attrs(_) {
      attrs = _;
      return this;
    },

    data(_) {
      root = _;
      preprocess();
      layout();
      render();
      return this;
    },

    on(event, cb) {
      dispatch.on(event, cb);
      return this;
    }
  }

  return panel;
}
