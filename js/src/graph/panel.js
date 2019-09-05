import * as d3 from 'd3';

import './panel.css';
import * as chromatic from "d3-scale-chromatic";

const DEFAULT_POINT_SIZE = 1;
const DEFAULT_AXIS_SIZE = 200;
const DEFAULT_CMAP = 'RdYlBu';
const DEFAULT_COLOR = 'lightblue';

export default function Panel() {
  let root = null;
  let svg = null;

  let axes = [];
  let graph = {};
  let pts_invalid = false;

  let color = '';
  let colorScale = d3.scaleSequential(chromatic['interpolate' + DEFAULT_CMAP]);

   let defs = [
      {id: 'arrowhead-start', path: "M10,-5L0,0L10,5", box: "0 -5 10 10", color: '#aaa', refx: 0, refy: 0 },
      {id: 'arrowhead-end', path: "M0,-5L10,0L0,5", box: "0 -5 10 10", color: '#ccc', refx: 0, refy: 0}
    ];

   /*
   * Dragging
   */

  let drag_x = 0;
  let drag_y = 0;
  let start_x = 0;
  let start_y = 0;


  let drag = d3.drag()
    .on('start', axisDragStart)
    .on('drag', axisDrag)
    .on('end', axisDragEnd);


  function axisDragStart(d){
    drag_x = d3.event.x;
    drag_y = d3.event.y;
    start_x = d.sx(d.max);
    start_y = d.sy(d.max);
  }

  function axisDrag(d) {
    let dx = d3.event.x - drag_x;
    let dy = d3.event.y - drag_y;

    let x = start_x + dx;
    let y = start_y + dy;
    d.theta = Math.atan2(y, x );
    d.len = Math.sqrt(x*x + y*y);
    d.sx.range([0, d.len*Math.cos(d.theta)]);
    d.sy.range([0, d.len*Math.sin(d.theta)]);

    project();
    render();
  }

  function axisDragEnd(d) {
    setTimeout( function() {
      d.model.set({
        theta: d.theta,
        len: d.len
      } );
      d.model.save_changes();
    }, 0);
  }

  function project() {
    let v;
    if (!graph || !graph.pts || !axes ) return;

    for (let pt of graph.pts) {
      let x = 0, y = 0;
      for (let axis of axes) {
        if (!axis.disabled) {
          v = pt.values[axis.col];
          x += axis.sx(v);
          y += axis.sy(v);
        }
      }
      pt.x = x;
      pt.y = y;
    }
    pts_invalid = false;
  }

  function update_colors() {
    let axis = axes.find( a => a.label === color);
    if (axis) {
      colorScale.domain([axis.max, 0]);
      for (let p of graph.pts) {
        p.color = colorScale(p.values[axis.col])
      }
    }
  }

  function render() {
    render_axes();
    if (!graph || !graph.pts) return;
    if (pts_invalid)
      project();
     render_pts();
     render_partitions();
  }

  function render_axes() {
   let o = svg.select('.pts').selectAll('.origin').data([0, 0]);
   o.enter()
     .append('circle')
     .attr('class', 'origin')
     .attr('r', DEFAULT_POINT_SIZE)
     .merge(o)
     .attr('cx', 0)
     .attr('cy', 0);

   let active = axes.filter(a => !a.disabled);
   let a = svg.select('.axes').selectAll('.axis').data(active, d => d.label);
   a.enter()
     .append('line')
      .attr('class', 'axis')
      .attr("marker-end", "url(#arrowhead-end)")
      .call(drag)
     .merge(a)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', d => d.sx(d.max))
      .attr('y2', d => d.sy(d.max));
   a.exit().remove();

   let names = svg.select('.labels').selectAll('.label').data(axes);
   names.enter()
     .append('text')
       .attr('class', 'label')
     .call(drag)
     .merge(names)
      .text(d => d.label)
       .attr('x', d => d.sx(d.max) + 10)
       .attr('y', d => d.sy(d.max));

   names.exit().remove();
  }

  function render_partitions() {
    let p = svg.select('.nodes').selectAll('.node').data(graph.nodes, d => d.pid);
    p.enter()
      .append('line')
        .attr('class', 'node')
      .merge(p)
        .attr('x1', d => d.min.x)
        .attr('y1', d => d.min.y)
        .attr('x2', d => d.max.x)
        .attr('y2', d => d.max.y)
        .attr('stroke', 'gray')
        .attr('stroke-width', '1px');
    p.exit().remove();

  }

  function render_pts() {
    let p = svg.select('.pts').selectAll('.pt').data(graph.pts, d => d.id);
    p.enter()
      .append('circle')
      .attr('class', 'pt')
      .attr('r', 3)
      .merge(p)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .style('fill', d => d.color)
    ;

    p.exit().remove();
  }

  function setup() {
    svg = root.select('svg');
    let g = svg.append('g');

     g.append('g')
      .attr('class', 'nodes');

    g.append('g')
      .attr('class', 'pts');

    g.append('g')
        .attr('class', 'axes');

    g.append('g')
      .attr('class', 'labels');

    let svgDefs = svg.select('defs');
      if (svgDefs.empty())
        svgDefs = svg.append('defs');

    svgDefs.selectAll('marker')
      .data(defs, d => d.id)
      .enter()
      .append('marker')
        .attr('id', d => d.id)
        .attr("viewBox", d => d.box)
        .attr("refX", d => d.refx)
        .attr("refY", d => d.refy)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('stroke-width', '1px')
        .append("path")
        .attr("d", d => d.path);
  }


  // API
  return {
    el(_) {
      root = _;
      setup();
      return this;
    },

    axes(_) {
      let n = _.length;
      let angle = 2*Math.PI/n;
      axes = _.map((axis, i) => {
        let updated = false;
        let theta = axis.get('theta');
        if (theta == null) {
          theta = angle * i;
          updated = true;
        }
        let len = axis.get('len');
        if (len == null) {
          len = DEFAULT_AXIS_SIZE;
          updated = true;
        }

        let max = axis.get('max');
        let disabled = axis.get('disabled');

        if (updated) {
          setTimeout(function () {
            axis.set({
              theta: theta,
              len: len
            });
            axis.save_changes();
          }, 0);
        }

        return {
          label: axis.get('label'),
          col: axis.get('col'),
          max,
          theta,
          len,
          disabled,
          model: axis,
          sx: d3.scaleLinear()
            .domain([0, max])
            .range([0, len * Math.cos(theta)]),
          sy: d3.scaleLinear()
            .domain([0, max])
            .range([0, len * Math.sin(theta)]),
        };
      });
      pts_invalid = true;
      return this;
    },

    update_axis(model) {
      let axis = axes.find( (d) => d.model === model);
      if (axis) {
        axis.label = model.get('label');
        axis.theta = model.get('theta');
        axis.len = model.get('len');
        axis.max = model.get('max');
        axis.sx.domain([0, axis.max]).range([0, axis.len*Math.cos(axis.theta)]);
        axis.sy.domain([0, axis.max]).range([0, axis.len*Math.sin(axis.theta)]);
      }
      update_colors();
      pts_invalid = true;
      return this;
    },

    graph(_) {
      graph = _;
      update_colors();
      pts_invalid = true;
      return this;
    },

    color(_) {
      color = _;
      update_colors();
      return this;
    },

    resize() {
      let w = parseInt(svg.style('width'));
      let h = parseInt(svg.style('height'));
      svg.select('g')
        .attr('transform', `translate(${w / 2},${h / 2})`);
      render();
      return this;
    },

    redraw() {
      render();
      return this;
    }
  }
}