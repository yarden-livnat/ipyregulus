import * as d3 from 'd3';
import * as chromatic from 'd3-scale-chromatic';
import tip from 'd3-tip'


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

  let range_def = [0, 1];
  let range_values = [0, 1];

  // let colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 1]).clamp(true);
  // let colorScale = d3.scaleQuantize().range(d3.schemeRdYlBu[11].concat().reverse());
  let initial_cmap = 'RdYlBu';
  let colorScale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);

  let x_type = 'linear';
  let y_type = 'linear';

  let sx = d3.scaleLinear().domain([0, 1]).range([0, width]).clamp(true);
  let sy = d3.scaleLinear().domain([Number.EPSILON, 1]).range([height, 0]).clamp(true);

  let y_axis = d3.axisLeft(sy).ticks(4, '.1');
  let x_axis = d3.axisBottom(sx).ticks(8, 'd');

  let dispatch = d3.dispatch('highlight', 'select', 'details');

  let tip_spec = [
    d => [attr, d3.format('.3f')(value(d))],
    d => ['id', d3.format('d')(d.id)],
    d => ['p_lvl', d3.format('.3f')(d.lvl)],
    d => ['pts', d.size],
    // d => ['internal', d.internal_size]
  ];

  function flatten(node, arr){
    arr.push(node);
    for (let child of node.children) {
      flatten(child, arr)
    }
    return arr;
  }

  function preprocess() {
    if (!root) return;
    nodes = flatten(root, []);
    sx.domain([0, root.internal_size]);
  }

  function layout() {
    if (!root) return;
    visit(root);

    function visit(node) {
      node.pos = {x: node.offset, y: node.lvl, w: node.internal_size, yp: node.parent ? node.parent.lvl : 1};
      for (let child of node.children) {
        visit(child);
      }
    }
  }

  function update() {
    update_range();
  }

  function update_range() {
    let minmax;
    if (range_def[0] === 'auto' || range_def[1] === 'auto') {
      minmax = d3.extent(nodes, value);
    }
    range_values = [
      range_def[0] === 'auto' ? minmax[0] : range_def[0],
      range_def[1] === 'auto' ? minmax[1] : range_def[1]
    ];
    colorScale.domain([range_values[1], range_values[0]]);
  }

  function value(d) {
    if (!attr) return null;
    if (attr in d) return d[attr];
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
      .on('mouseenter', show_tip)
      .on('mouseleave', hide_tip)
      .on('click', on_select)
      // .on('click', ensure_single(on_details))
      // .on('dblclick', on_select)
    .merge(d3nodes)
      .style('visibility', d => !show || show.has(d.id) ? 'visible' : 'hidden')
      .attr('x', d => sx(d.pos.x))
      .attr('y', d => sy(d.pos.yp))
      .attr('width', d => Math.max(1, sx(d.pos.x + d.pos.w) - sx(d.pos.x)-1))
      .attr('height', d => Math.max(0, sy(d.pos.y) - sy(d.pos.yp)-1))
      .style('fill', d => d.id === highlighted ? 'lightgray' : color(d))
      .classed('highlight', d => d.id === highlighted)
      .classed('selected', d => selected.has(d.id))
      .classed('details', d => detailed.has(d.id));

    d3nodes.exit().remove();
  }

  let tip_timer = null;

  function show_tip(d) {
    if (tip_timer) {
      clearTimeout(tip_timer);
      tip_timer = null;
    }
    node_tip.show.apply(this, arguments);
    d3.select(this).on('mousemove', update_tip);
    dispatch.call('highlight', this, d.id);
  }

  function hide_tip() {
    tip_timer = setTimeout( remove_tip, 250, this, arguments);
    d3.select(this).on('mousemove', null);
  }

  function remove_tip(self, args) {
      tip_timer = null;
      node_tip.hide.apply(self, args);
      dispatch.call('highlight', this, -1);
  }

  function update_tip() {
    node_tip.show.apply(this, arguments);
  }

  function on_select(d) {
    dispatch.call('select', this, d.id, !selected.has(d.id));
  }

  function on_details(d) {
    dispatch.call('details', this, d.id, !detailed.has(d.id));
  }

  // function on_highlight(d) {
  //   if (d.id === highlighted) {
  //     highlighted = -1;
  //   }
  //   else {
  //     highlighted = d.id;
  //     dispatch.call('highlight', this, highlighted);
  //   }
  //   dispatch.call('highlight', this, highlighted);
  // }


  return {
    el(_) {
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

      node_tip = tip()
        .attr('class', 'd3-tip')
        .offset( function() {
          let m = d3.mouse(this);
          let bb = this.getBBox();
          return [m[1]-bb.y-20, m[0]-bb.x-bb.width/2];
        })
          .html(d => {
            let content = tip_spec.map(spec => {
              let rec = spec(d);
              return `<tr><td>${rec[0]}:</td><td style="text-align: right">${rec[1]}</td></tr>`;
            }).join('');
            return `<table>${content}</table>`;
          });

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
      // if (attr) return null;
      update();
      return this;
    },

    attrs(_) {
      attrs = _;
      update();
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

    highlight(id) {
      if (highlighted !== id) {
        highlighted = id;
        render();
      }
      return this;
    },

    details(_) {
      detailed = _;
      render();
      return this;
    },

    range(_) {
      range_def = _;
      update_range();
      render();
      return this;
    },

    select(_) {
      selected = _;
      render();
      return this;
    },

    x(_) {
      sx.domain(_);
      render();
      return this;
    },

    y(_) {
      sy.domain(_);
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
  };
}
