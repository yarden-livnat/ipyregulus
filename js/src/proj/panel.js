import * as d3 from 'd3';
import tip from 'd3-tip'

import './panel.css';
import * as chromatic from "d3-scale-chromatic";
import {Partition} from "../models/partition";

const DEFAULT_POINT_SIZE = 2;
const DEFAULT_AXIS_SIZE = 200;
const DEFAULT_CMAP = 'RdYlBu';
const DEFAULT_COLOR = 'lightblue';

export default function Panel(view, el) {
  let root = d3.select(el);
  let model = view.model;
  let svg = null;
  let overlay = null;

  let axes = [];
  let active_pts = [];
  let bg_pts = [];
  let show = new Set();
  let highlight = -2;
  let highlight_ignored = false;
  // let colors = [];
  let show_inverse = false;
  let color = '';
  let color_info = [null, 0, 1];
  let inverse = new Map();

  let colorScale = d3.scaleSequential(chromatic['interpolate' + DEFAULT_CMAP]);

  let pts_invalid = false;
  let color_invalid = false;
  let active_invalid = false;
  let graph_invalid = false;
  let inverse_invalid = false;

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

  let graph_edges = [];
  let graph_pts = [];
  let origin = {px: 0, py:0, x:0, y:0};

  let show_graph = true;
  let show_pts = true;
  let disabled = true;
  let dragging = false;

  let node_tip;
  let tip_spec = [
    d => ['value', d3.format('.3f')(d.value)],
    d => ['id', d3.format('d')(d.id)],
    d => ['pid', d.partitions.map(d3.format('d'))]
  ];
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
    model.on('change:show_graph', show_graph_changed);
    model.on('change:show_pts', show_pts_changed);
    model.on('change:inverse', inverse_changed);
    model.on('change:show_inverse', show_inverse_changed);

    disabled = true;
    data_changed();
    axes_changed();
    highlight_changed();
    color_changed();
    show_changed();
    show_pts_changed();
    show_graph_changed();
    show_inverse_changed();
    disabled = false;
    render()
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
      partitions = new Map(data.get('partitions')
        .map(p => [p.id, {span: p.pts_span, extrema: p.extrema, minmax_idx: p.minmax_idx}]));
      measure = data.get('measure');
      y_idx = attrs_idx.indexOf(measure);
      pts_invalid = true;

    } else {
      pts_extent = [];
      active_invalid = true;
    }
    show = new Set();
    graph_invalid = true;
    render();
  }

  function axes_changed() {
    if (dragging) return;

    for (let p of model.previous('axes') || []) {
      p.off('change', update_axis)
    }

    for (let a of model.get('axes')) {
      a.on('change', update_axis);
    }

    let a = model.get('axes');
    axes = a.map((axis, i) => {
      return {
        col: axis.get('col'),
        model: axis,
        sx: d3.scaleLinear(),
        sy: d3.scaleLinear(),
      }
    });

    disabled = true;
    axes.forEach(d => update_axis(d.model));
    disabled = false;
    render();
  }


  function update_axis(axis_model) {
    if (dragging) return;

    let axis = axes.find( d => d.model === axis_model);
    if (axis) {
      axis.col = axis.model.get('col');
      axis.label = axis_model.get('label');
      axis.theta = axis_model.get('theta');
      axis.len = axis_model.get('len');
      axis.disabled = axis_model.get('disabled');

      let domain = !pts_extent || !pts_extent.length ? [0, 1] :
        axis.col> 0 ? pts_extent[axis.col-1] : attrs_extent[y_idx];
      axis.sx.domain(domain).range([0, axis.len * Math.cos(axis.theta)]);
      axis.sy.domain(domain).range([0, axis.len * Math.sin(axis.theta)]);

      axis.max = domain[1];
      axis.px = axis.sx(axis.max);
      axis.py = axis.sy(axis.max);

      transform([axis]);
      pts_invalid = true;
      inverse_invalid = true;
      render();
    }
  }

  function color_changed() {
    color_info = model.get('color_info');
    colorScale.domain([color_info[2], color_info[1]]);
    graph_invalid = true;
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
    } else{
      render_graph();
    }
  }

  function show_pts_changed() {
    show_pts = model.get('show_pts');
    active_invalid = true;
    render();
  }

  function show_graph_changed() {
    show_graph = model.get('show_graph');
    graph_invalid = true;
    render();
  }

  function show_inverse_changed() {
    show_inverse = model.get('show_inverse');
    if (show_inverse)
      inverse_invalid = true;
    render();
  }

  function inverse_changed() {
    let new_lines = model.get('inverse');
    if (!new_lines) return;

    for (let [pid, line] of Object.entries(new_lines)) {
      inverse.set(parseInt(pid), {id: pid, values:line} );
    }
    if (show_inverse) {
      inverse_invalid = true;
      render();
    }
  }

  /*
  * Dragging
  */

  let drag = d3.drag()
    .on('start', axisDragStart)
    .on('drag', axisDrag)
    .on('end', axisDragEnd);

  let drag_dx = 0;
  let drag_dy = 0;

  function axisDragStart(d){
    dragging = true;
    drag_dx = d3.event.x - d.x;
    drag_dy = d3.event.y - d.y;
  }

  function axisDrag(d) {
    let tr = d3.zoomTransform(svg.node());
    let [x, y] = tr.invert ([d3.event.x - drag_dx, d3.event.y - drag_dy]);

    let theta = Math.atan2(y, x );
    if (d3.event.sourceEvent.shiftKey) {
      theta = Math.round(theta*2/Math.PI)*Math.PI/2;
    }
    d.theta = theta;
    d.len = Math.sqrt(x*x + y*y);

    d.sx.range([0, d.len*Math.cos(d.theta)]);
    d.sy.range([0, d.len*Math.sin(d.theta)]);

    d.px = d.sx(d.max);
    d.py = d.sy(d.max);

    transform([d]);

    setTimeout( function() {
      d.model.set({
        theta: d.theta,
        len: d.len
      } );
      d.model.save_changes();
    }, 0);

    pts_invalid = true;
    if (show_inverse) inverse_invalid = true;
    render();
  }

  function axisDragEnd(d) {
    dragging = false;
    setTimeout( function() {
      d.model.set({
        theta: d.theta,
        len: d.len
      } );
      d.model.save_changes();
    }, 0);
  }

  function project(pts_list) {
    for (let pt of pts_list) {
      let x = 0, y = 0, v;

      for (let axis of axes) {
        if (!axis.disabled) {
          v = axis.col === 0 ?
            attrs.get(pt.id, y_idx) :
            pts.get(pt.id, axis.col - 1);
          x += axis.sx(v);
          y += axis.sy(v);
        }
      }
      pt.px = x;
      pt.py = y;
    }
    transform(pts_list);
  }

  function project_curve(curve) {
    for (let pt of curve.values) {
      let x = 0, y = 0, v;
      for (let axis of axes) {
        if (!axis.disabled) {
          v = pt[axis.col];
          x += axis.sx(v);
          y += axis.sy(v);
        }
      }
      pt.px = x;
      pt.py = y;
    }
  }

  /*
  * Zoom
  */

  let zoom = d3.zoom()
    .scaleExtent([0.1, 8])
    .on('start', zoomStarted)
    .on('zoom', zoomed);

  function enableZoom() {
    svg.call(zoom);
  }

  function disableZoom() {
    svg.on('zoom', null);
  }

  function zoomStarted() {
  }

  function zoomed() {
    transform(bg_pts);
    transform(active_pts);
    transform(graph_pts);
    transform([origin]);
    transform(axes);
    if (show_inverse)
      inverse_invalid = true;
    render();
  }

  function transform(objs) {
    let tr = d3.zoomTransform(svg.node());
    objs.forEach(d => [d.x, d.y] = tr.apply([d.px, d.py]));
  }

  /*
   * updates
   */

  function validate() {
    if (active_invalid) {
      update_active();
      graph_invalid = true;
    }

    if (pts_invalid) {
      project(bg_pts);
      project(active_pts);

      pts_invalid = false;
      color_invalid = true;
      graph_invalid = true;
    }

    if (color_invalid) {
      update_colors();
      graph_invalid = true;
      color_invalid = false;
    }

    if (graph_invalid) {
      update_graph();
      graph_invalid = false;
    }

    if (inverse_invalid){
      for (let edge of graph_edges)
        if (inverse.has(edge.id)) {
          let curve = inverse.get(edge.id);
          project_curve(curve);
          transform(curve.values);
          // curves.push({id: edge.id, curve: curve.values});
        }
      inverse_invalid = false;
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

  function update_graph() {
    graph_edges = [];
    graph_pts = [];
    let pts_map = new Map();

    if (show_graph) {
      for (let pid of show) {
        let p = partitions.get(pid);
        let min_pt, max_pt;
        if (pts_map.has(p.minmax_idx[0])) {
          min_pt = pts_map.get(p.minmax_idx[0]);
          min_pt.partitions.push(pid);
        } else {
          min_pt = {
            id: p.minmax_idx[0],
            x: 0, y: 0,
            value: attrs.get(p.minmax_idx[0], color_info[0]),
            partitions: [pid]
          };
          pts_map.set(p.minmax_idx[0], min_pt);
        }
        if (pts_map.has(p.minmax_idx[1])) {
          max_pt = pts_map.get(p.minmax_idx[1]);
          max_pt.partitions.push(pid)
        } else {
          max_pt = {
            id: p.minmax_idx[1],
            x: 0, y: 0,
            value:attrs.get(p.minmax_idx[1], color_info[0]),
            partitions: [pid]
          };
          pts_map.set(p.minmax_idx[1], max_pt);
        }
        graph_edges.push({id: pid, min: min_pt, max: max_pt});
      }
      graph_pts = Array.from(pts_map.values());

      project(graph_pts);
      for (let pt of graph_pts) {
        pt.color = colorScale(attrs.get(pt.id, color_info[0]));
      }
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

    if (data && show_pts) {
      if (highlight < 0 || !show.has(highlight))
        active_pts = collect(show, -1);
      else  {
        bg_pts = collect(show, highlight);
        active_pts = collect([highlight], -1);
      }
    }
    pts_invalid = true;
    color_invalid = true;
  }

  function render() {
    if (disabled) return;

    validate();
    render_pts();
    render_graph();
    render_axes();
  }

  function render_axes() {
    let o = svg.select('.axes').selectAll('.pt').data([origin]);
    o.enter()
      .append('circle')
      .attr('class', 'pt')
      .attr('r', DEFAULT_POINT_SIZE)
      .merge(o)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    let active = axes.filter(a => !a.disabled);

    let a = svg.select('.axes').selectAll('.axis')
      .data(active, d => d.label);

    a.enter()
      .append('line')
        .attr('class', 'axis')
        .attr("marker-end", "url(#arrowhead-end)")
        .call(drag)
      .merge(a)
        .attr('x1', origin.x)
        .attr('y1', origin.y)
        .attr('x2', d => d.x)
        .attr('y2', d => d.y);

    a.exit().remove();

    let names = svg.select('.axes').selectAll('.label').data(active);
    names.enter()
      .append('text')
        .attr('class', 'label')
        .call(drag)
      .merge(names)
        .text(d => d.label)
        .attr('x', d => d.x + 10)
        .attr('y', d => d.y);

    names.exit().remove();
  }

  function render_pts_group(group, group_pts, tip=false) {
    let g = svg.select(group).selectAll('.pt').data(group_pts);

    g.exit().remove();

    let enter = g.enter()
      .append('circle')
        .attr('class', 'pt')
        .attr('r', 3);

    if (tip)
      enter
        .on('mouseenter', show_tip)
        .on('mouseleave', hide_tip);

    return enter
      .merge(g)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .style('fill', d => d.color);
  }

  function render_pts() {
    render_pts_group('.bg', bg_pts)
      .attr('r', 1);

    render_pts_group('.fg', active_pts);
  }

  function render_graph() {
    render_pts_group('.graph', graph_pts, true)
      .attr('r', 5);

    let edges = [];
    let curves = [];

    if (show_inverse) {
      for (let edge of graph_edges)
        if (inverse.has(edge.id)) {
          let curve = inverse.get(edge.id);
          curves.push({id: edge.id, curve: curve.values});
        }
        else
          edges.push(edge);
    } else {
      edges = graph_edges;
    }

    let d3edges = svg.select('.graph').selectAll('.edge')
      .data(edges, d => d.pid);

    d3edges.enter()
      .append('line')
      .attr('class', 'edge')
      .on('mouseover', d => highlight_partition(d.id, true))
      .on('mouseout',d => highlight_partition(d.id, false))
      .merge(d3edges)
        .classed('highlight', d => d.id === highlight)
        .attr('x1', d => d.min.x)
        .attr('y1', d => d.min.y)
        .attr('x2', d => d.max.x)
        .attr('y2', d => d.max.y);

    d3edges.exit().remove();

    let curve = d3.line().x(d => d.x).y(d => d.y);

    let d3curves = svg.select('.graph').selectAll('.curve')
      .data(curves, d => d.id);

    d3curves.enter()
      .append('path')
      .attr('class', 'curve')
      .on('mouseover', d => highlight_partition(d, true))
      .on('mouseout',d => highlight_partition(d, false))
      .merge(d3curves)
        .classed('highlight', d => d.id === highlight)
        .attr('d', d => curve(d.curve));

    d3curves.exit().remove();
  }

  function highlight_partition(id, on) {
    model.set('highlight', on ? id : -1);
    view.touch();
  }

  /*
   * tip
   */

  let tip_timer = null;

  function show_tip(d) {
    if (tip_timer) {
      clearTimeout(tip_timer);
      tip_timer = null;
    }
    node_tip.show.apply(this, arguments);
    d3.select(this).on('mousemove', update_tip);
    for (let id of d.partitions) {
      // console.log('highlight:', id);
      highlight_partition(id, true);
    }
  }

  function hide_tip() {
    tip_timer = setTimeout( remove_tip, 250, this, arguments);
    d3.select(this).on('mousemove', null);
  }

  function remove_tip(self, args) {
    tip_timer = null;
    node_tip.hide.apply(self, args);
    for (let id of args[0].partitions) {
      // console.log('highlight:', id);
      highlight_partition(id, false);
    }
  }

  function update_tip() {
    node_tip.show.apply(this, arguments);
  }

  function setup() {
    svg = root.select('svg');

    let g = svg.append('g');

    g.append('g')
      .attr('class', 'bg');

    g.append('g')
      .attr('class', 'fg');

    g.append('g')
      .attr('class', 'axes');

    g.append('g')
      .attr('class', 'graph');

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

    enableZoom();
  }


  init();

  let resize_timer = null;

  function trigger_resize() {
    resize_timer = null;
    active_invalid = true;
    render();
  }

  // API
  return {
    resize() {
      let w = parseInt(svg.style('width'));
      let h = parseInt(svg.style('height'));
      // console.log('resize:',w , h);
      svg.attr('viewBox', [-w/2, -h/2, w, h]);
      zoom.extent([[0,0], [w,h]]);

      if (resize_timer)
        clearTimeout(resize_timer);
      resize_timer = setTimeout( trigger_resize, 250);
      return this;
    },
  }
}