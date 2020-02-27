import * as d3 from 'd3';

import './panel.css';
import * as chromatic from "d3-scale-chromatic";
import {Partition} from "../models/partition";

const DEFAULT_POINT_SIZE = 1;
const DEFAULT_AXIS_SIZE = 200;
const DEFAULT_CMAP = 'RdYlBu';
const DEFAULT_COLOR = 'lightblue';

export default function Panel(view, el) {
  let root = d3.select(el);
  let model = view.model;
  let svg = null;

  let axes = [];
  let active_pts = [];
  let bg_pts = [];
  let show = new Set();
  let highlight = -2;
  let highlight_ignored = false;
  // let colors = [];
  let color = '';
  let color_info = [null, 0, 1];

  let colorScale = d3.scaleSequential(chromatic['interpolate' + DEFAULT_CMAP]);

  let pts_invalid = false;
  let color_invalid = false;
  let active_invalid = false;

  let data = null;
  let partitions = new Map();
  let pts_loc = [];
  let pts = [];
  let pts_idx = [];
  let pts_extent = null;
  let attrs = [];
  let attrs_idx = [];
  let attrs_extent = null;
  let y_idx = 0;
  let measure = '';


  let defs = [
    {id: 'arrowhead-start', path: "M10,-5L0,0L10,5", box: "0 -5 10 10", color: '#aaa', refx: 0, refy: 0 },
    {id: 'arrowhead-end', path: "M0,-5L10,0L0,5", box: "0 -5 10 10", color: '#ccc', refx: 0, refy: 0}
  ];


  function init()  {
    setup();

    model.on('change:data', data_changed);
    model.on('change:axes', axes_changed);
    model.on('change:show', show_changed);
    model.on('change:color_info', color_changed);
    model.on('change:highlight', highlight_changed);

    data_changed();
    axes_changed();
  }

  function data_changed() {
    let p = model.previous('data');
    if (p) p.off('change:version', model_updated);

    let m = model.get('data');
    if (m) m.on('change:version', model_updated);

    model_updated();
  }

  function model_updated() {
    data = model.get('data');
    if (data) {
      pts_loc = data.get('pts_loc');
      pts = data.get('pts');
      pts_idx = data.get('pts_idx');
      pts_extent = data.get('pts_extent');
      attrs = data.get('attrs');
      attrs_idx = data.get('attrs_idx');
      attrs_extent = data.get('attrs_extent');
      partitions = new Map(data.get('partitions').map(p => [p.id, {span: p.pts_span, extrema: p.extrema}]));
      measure = data.get('measure');
      y_idx = attrs_idx.indexOf(measure);
      pts_invalid = true;

    } else {
      pts_extent = [];
      active_invalid = true;
    }
    show = new Set();
  }

  function axes_changed() {
    for (let p of model.previous('axes') || []) {
      p.off('change', update_axis)
    }

    for (let a of model.get('axes')) {
      a.on('change', update_axis);
    }

    let a = model.get('axes');
    let n = a.length;
    let angle_start = -Math.PI/2;
    let angle = 2*Math.PI/n;
    axes = a.map((axis, i) => {
      let updated = false;
      let theta = axis.get('theta');
      if (theta == null) {
        theta = angle_start + angle * i;
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

      let domain = !pts_extent || !pts_extent.length ? [0, 1] :
                   i > 0 ? pts_extent[i-1] : attrs_extent[y_idx];

      return {
        label: axis.get('label'),
        col: axis.get('col'),
        max,
        theta,
        len,
        disabled,
        model: axis,
        sx: d3.scaleLinear()
          .domain(domain)
          .range([0, len * Math.cos(theta)]),
        sy: d3.scaleLinear()
          .domain(domain)
          .range([0, len * Math.sin(theta)]),
      };
    });
    pts_invalid = true;
    render();
  }


  function update_axis(axis_model) {
    let axis = axes.find( d => d.model === axis_model);
    if (axis) {
      axis.label = axis_model.get('label');
      axis.theta = axis_model.get('theta');
      axis.len = axis_model.get('len');
      axis.max = axis_model.get('max');
      axis.disabled = axis_model.get('disabled');

     let domain = !pts_extent || !pts_extent.length ? [0, 1] :
                   axis.col> 0 ? pts_extent[axis.col-1] : attrs_extent[y_idx];
      axis.sx.domain(domain);
      axis.sy.domain(domain);

      axis.sx.range([0, axis.len * Math.cos(axis.theta)]);
      axis.sy.range([0, axis.len * Math.sin(axis.theta)]);

      // axis.sx.domain([0, axis.max]).range([0, axis.len * Math.cos(axis.theta)]);
      // axis.sy.domain([0, axis.max]).range([0, axis.len * Math.sin(axis.theta)]);

      pts_invalid = true;
      render();
    }
  }

  function color_changed() {
    color_info = model.get('color_info');
    colorScale.domain([color_info[2], color_info[1]]);
    color_invalid = true;
    render();
  }

  function show_changed() {
    show = new Set(model.get('show'));
    active_invalid = true;
    render();
  }

  function highlight_changed() {
    highlight = model.get('highlight');
    if (show.has(highlight) || bg_pts.length > 0) {
      active_invalid = true;
      render();
    }
  }

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

    setTimeout( function() {
      d.model.set({
        theta: d.theta,
        len: d.len
      } );
      d.model.save_changes();
    }, 0);

    pts_invalid = true;
    // project();
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

  function project(list) {
    for (let pt of list) {
      let x = 0, y = 0, v;

      for (let axis of axes) {
        if (!axis.disabled) {
          v = axis.col === 0 ?
            attrs.get(pt.id, y_idx) :
            pts.get(pt.id, axis.col-1);
          x += axis.sx(v);
          y += axis.sy(v);
        }
      }
      pt.x = x;
      pt.y = y;
    }
  }

  function update_colors() {
    for (let pt of active_pts) {
      pt.color = colorScale(attrs.get(pt.id, color_info[0]));
    }
    // let n = Math.min(colors.length, pts.length);
    // let i = -1;
    // while (++i< n) {
    //   pts[i].color = colorScale(colors[i]);
    // }
    // n = pts.length;
    // while (++i < n) {
    //   pts[i].color = DEFAULT_COLOR;
    // }
  }

  function validate() {
    if (active_invalid)
      update_active();

    if (pts_invalid) {
      project(active_pts);
      project(bg_pts);
      pts_invalid = false;
      color_invalid = true;
    }

    if (color_invalid) {
      update_colors();
      color_invalid = false;
    }
  }

  function collect(list, ignore) {
    let set = new Set();
    for (let pid of list) {
      if (pid === ignore) continue;
      let p = partitions.get(pid);
      if (!p) continue;

      for (let i = p.span[0]; i < p.span[1]; i++)
        set.add(pts_loc[i]);

      for (let j of p.extrema)
        set.add(j);
    }
    list = [];
    for (let i of set.values()) {
      list.push({id: i, x: 0, y: 0})
    }
    return list;
  }

  function update_active(){
    active_pts = [];
    bg_pts = [];
    if (data) {
      if (highlight < 0 || !show.has(highlight))
        active_pts = collect(show, -1);
      else  {
        bg_pts = collect(show, highlight);
        active_pts = collect([highlight], -1);
      }
    }
    pts_invalid = true;
  }

  function render() {
    console.log('proj render');
    validate();
    render_pts();
    render_axes();
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

   let names = svg.select('.labels').selectAll('.label').data(active);
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

  function render_pts() {
    let bg = svg.select('.pts').selectAll('.bg').data(bg_pts);
    bg.enter()
      .append('circle')
      .attr('class', 'bg')
      .attr('r', 1)
      .merge(bg)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .style('fill', 'lightgray')
    ;
    bg.exit().remove();

    let p = svg.select('.pts').selectAll('.pt').data(active_pts);
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
        .attr('class', 'axes');

    g.append('g')
      .attr('class', 'pts');

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


  init();

  // API
  return {
    resize() {
      let w = parseInt(svg.style('width'));
      let h = parseInt(svg.style('height'));
      svg.select('g')
        .attr('transform', `translate(${w / 2},${h / 2})`);
      pts_invalid = true;
      render();
      return this;
    },
  }
}