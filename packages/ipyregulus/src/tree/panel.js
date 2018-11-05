

import * as d3 from 'd3';
import * as chromatic from 'd3-scale-chromatic';

import '../utils/d3-tip';
import {ensure_single} from '../utils/events';
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
  let attr = null;
  let attrs = {};
  let show = null;
  let node_tip;
  let format = d3.format('.3f');

  let selected = new Set();
  let detailed = new Set();
  let highlighted = -2;

  // let colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 1]).clamp(true);
  // let colorScale = d3.scaleQuantize().range(d3.schemeRdYlBu[11].concat().reverse());
  let initial_cmap = 'RdYlBu';
  let cscale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);
  let colorScale = v => cscale(1-v);

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
    // selected = null
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
    if (!attr) return null;
    if (attr in d) return d[attr]
    if (attr in attrs) return attrs[attr][d.id];
    return null;
  }

  function color(d) {
    let v = value(d);
    return v != null && colorScale(v) || 'lightgray';
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
      .on('mouseenter.tip', show_tip)
      .on('mouseleave.tip', hide_tip)
      .on('mouseenter.hover', d => on_hover(d, true))
      .on('mouseleave.hover', d => on_hover(d, false))
      .on('click', ensure_single(on_details))
      .on('dblclick', on_select)
    .merge(d3nodes)
      .style('visibility', d => !show || show.has(d.id) ? 'visible' : 'hidden')
      .attr('x', d => sx(d.pos.x))
      .attr('y', d => sy(d.pos.yp))
      .attr('width', d => Math.max(1, sx(d.pos.x + d.pos.w) - sx(d.pos.x)-1))
      .attr('height', d => Math.max(0, sy(d.pos.y) - sy(d.pos.yp)-1))
      .style('fill', color)
      .classed('highlight', d => d.id == highlighted)
      .classed('selected', d => selected.has(d.id))
      .classed('details', d => detailed.has(d.id));
      ;

    d3nodes.exit().remove();
  }

  function show_tip() {
    node_tip.show.apply(this, arguments);
    d3.select(this).on('mousemove', update_tip)
  }

  function hide_tip() {
    node_tip.hide.apply(this, arguments);
    d3.select(this).on('mousemove', null);
  }

  function update_tip() {
    node_tip.show.apply(this, arguments);
  }

  function on_hover(d, on) {
    // if (on) {
    //   node_tip.show();
    // } else {
    //   node_tip().hide()
    // }
    dispatch.call('highlight',this, on ? d.id : -2);
  }

  function on_select(d) {
      // d.selected = !d.selected;

      // render_names();
      dispatch.call('select', this, d.id, !selected.has(d.id));
    }

  function on_details(d) {
    // d.details = !d.details;
    dispatch.call('details', this, d.id, !detailed.has(d.id));
    // if (d.details) on_select(d);
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
        .html(d => `id: ${d.id}<br>lvl: ${format(d.lvl)}<br>${attr}: ${format(value(d))}<br>size: ${d.size}`);

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

    attr(_) {
      attr = _;
      update()
      return this;
    },

    attrs(_) {
      attrs = _;
      update()
      return this;
    },

    show(_) {
      show = _ && new Set(_) || null;
      return this;
    },

    data(_) {
      root = _;
      preprocess();
      layout();
      update();
      return this;
    },

    highlight(node) {
      highlighted = node;
      render();
      return this;
    },

    details(_) {
      detailed = _;
      render();
      return this;
    },

    select(_) {
      selected = _;
      render();
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
