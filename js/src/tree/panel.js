

import * as d3 from 'd3';
import '../d3-tip';

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
  let hide = new Set();
  let node_tip;
  let format = d3.format('.3s');

  let selected = null;

  // let colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 1]).clamp(true);
  let colorScale = d3.scaleQuantize().range(d3.schemeRdYlBu[11].concat().reverse());

  let x_type = 'linear';
  let y_type = 'linear';

  let sx = d3.scaleLinear().domain([0, 1]).range([0, width]).clamp(true);
  let sy = d3.scaleLinear().domain([Number.EPSILON, 1]).range([height, 0]).clamp(true);

  let y_axis = d3.axisLeft(sy).ticks(4, '.1');
  let x_axis = d3.axisBottom(sx).ticks(8, 'd');

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
    visit(root);

    function visit(node) {
      node.pos = {x: node.offset, y: node.lvl, w: node.size, yp: node.parent && node.parent.lvl || 1};
      for (let child of node.children) {
        visit(child);
      }
      // let w = range[1] - range[0];
      // node.pos = {x: node.offset, y: node.lvl, w: node.size, yp: node.parent && node.parent.lvl || 1};
      // let from = range[0];
      // for (let child of node.children) {
      //   let to = from + child.size; // w * child.size / node.size;
      //   visit(child, [from, to], depth+1);
      //   from = to;
      // }
    }
  }

  function update() {
  }

  function value(d) {
    if (!field) return null;
    if (field in d) return d[field]
    if (field in attrs) return attrs[field][d.id];
    return null;
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
      .on('mouseenter', node_tip.show)
      .on('mouseleave', node_tip.hide)
      // .on('click', ensure_single(details))
      // .on('dblclick', select)
    .merge(d3nodes)
      .style('visibility', d => hide.has(d.id) && 'hidden' || 'visible')
      .attr('x', d => sx(d.pos.x))
      .attr('y', d => sy(d.pos.yp))
      .attr('width', d => Math.max(1, sx(d.pos.x + d.pos.w) - sx(d.pos.x)-1))
      .attr('height', d => Math.max(0, sy(d.pos.y) - sy(d.pos.yp)-1))
      .style('fill', d => colorScale(value(d) || 0))
      // .classed('highlight', d => d.highlight)
      // .classed('selected', d => d.selected)
      // .classed('details', d => d.details);
      ;

    d3nodes.exit().remove();
  }

  function hover(d, on) {
    if (on) {
      node_tip.show();
    } else {
      node_tip().hide()
    }
    dispatch.call('highlight',this, d, on);
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

      node_tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset( function() {
          let m = d3.mouse(this);
          let bb = this.getBBox();
          return [m[1]-bb.y-10, m[0]-bb.x-bb.width/2];
        })
        .html(d => `id: ${d.id}<br>lvl: ${format(d.lvl)}<br>size: ${d.size}<br>${field}: ${format(value(d))}`);

      svg.call(node_tip);

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
      update()
      return this;
    },

    attrs(_) {
      attrs = _;
      update()
      return this;
    },

    hide(_) {
      hide = new Set(_);
      return this;
    },

    data(_) {
      root = _;
      preprocess();
      layout();
      update();
      return this;
    },

    redraw() {
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
