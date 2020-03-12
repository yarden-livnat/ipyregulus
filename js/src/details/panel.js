import * as d3 from 'd3';
import * as chromatic from 'd3-scale-chromatic';
// import '../utils/keybinding';

import {
  Partition
} from '../models/partition';

import Plot from './plot';
import './panel.css';
import row_header_template from './row_header.html';

let PLOT_WIDTH = 100;
let PLOT_HEIGHT = 100;
let PLOT_BORDER = 1;
let PLOT_GAP = 5;
let ROW_HEIGHT = PLOT_HEIGHT + 8;

let DURATION = 1000;

export default function Panel(ctrl) {
  let root = null;
  let svg = null;

  let controller = ctrl;
  let model = null;
  let data = null;
  let pts_loc = null;
  let pts = null;
  let pts_idx = [];
  let pts_extent = [];
  let attrs = null;
  let attrs_idx = [];
  let attrs_extent = [];
  let partitions = new Map();
  let measure = '';
  let local_norm = false;
  let show_model = true;

  let measure_idx = 0;
  let show = [];
  let filtered = [];
  let highlighted = -2;
  let inverse = new Map();
  let show_info = new Map();
  let show_inverse = false;

  let initial_cmap = 'RdYlBu';
  let colorScale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);
  let color_idx = measure_idx;

  let cols = [];
  let rows = [];
  let plots = [];

  let plot_renderer =  Plot();

  function sync() {
    controller.touch();
  }

  function set_model(_) {
    model = _;
    model.on('change:data', model_changed);
    model.on('change:show_info', show_info_changed);
    model.on('change:highlight', highlight_changed);
    model.on('change:inverse', inverse_changed);
    model.on('change:show_inverse', show_inverse_changed);
    model.on('change:cmap', cmap_changed);
    model.on('change:color', color_changed);
    model.on('change:local_norm', norm_changed);
    model.on('change:show_model', show_model_changed);
    model_changed();
    show_info_changed();
    show_inverse_changed();
  }

  function model_changed() {
    let p = model.previous('data');
    if (p) p.off('change:version', model_updated);

    let m = model.get('data');
    if (m) m.on('change:version', model_updated);

    model_updated();
  }

  function model_updated() {
    update_data_model(model.get('data'));

    update_color();
    update_cols();
    update_rows();
    update_plots();
    render();
  }

  function norm_changed() {
    local_norm = model.get('local_norm');
    show_info_changed();
  }

  function show_model_changed() {
    show_model = model.get('show_model');
    if (measure_idx !== -1) {
      update_plots();
      render();
    }
  }

  function show_info_changed() {
    let info = model.get('show_info');
    show_info = new Map();
    let max = 0;
    let max_intercept = 0;

    for (let [id, record] of Object.entries(info)) {
      let coef = record.coef;
      let n_coef = coef;
      let local_max = coef.reduce((a,v) => Math.max(a, Math.abs(v)), 0);
      if (local_norm)
        n_coef = coef.map(v => v/local_max);
      else
        max = Math.max(max, local_max);
      max_intercept = Math.max(max_intercept, Math.abs(record.intercept));
      show_info.set(parseInt(id), {intercept: record.intercept, coef:coef, n_coef: n_coef});
    }

    for (let [id, record] of show_info.entries()) {
      if (!local_norm) {
        for (let i in record.n_coef)
          record.n_coef[i] /= max;
      }
      record.n_intercept  = record.intercept / max_intercept;
    }

    show = Array.from(show_info.keys());

    if (measure_idx !== -1) {
      update_rows();
      update_plots();
      render();
    }
  }

  function highlight_changed() {
    highlighted = model.get('highlight');
    if (measure_idx !== -1) {
      render_rows();
    }
  }

  function show_inverse_changed() {
    show_inverse = model.get('show_inverse');
    update_plots();
    render();
  }

  function inverse_changed() {
    let new_lines = model.get('inverse');
    if (!new_lines) return;

    for (let [pid, line] of Object.entries(new_lines)) {
      inverse.set(parseInt(pid), line);
    }
    update_plots();
    render();
  }

  function cmap_changed() {
    let cmap = model.get('cmap');
    colorScale = d3.scaleSequential(chromatic['interpolate' + cmap]);
    if (measure_idx !== -1) {
      update_plots();
      render();
    }
  }

  function color_changed() {
    if (measure_idx === -1)  return;
    let idx = color_idx;
    update_color();
    if (idx !== color_idx) {
      update_plots();
      render();
    }
  }

  function update_color() {
    let color = model.get('color');
    color_idx = -1;
    if (color && color !== '' && attrs)
      color_idx = attrs_idx.indexOf(color);

    if (color_idx === -1)
        color_idx = measure_idx;
    if (color_idx !== -1)
      colorScale.domain(reverse(attrs_extent[color_idx]));

    root.select('.rg_color').text(color);
  }

  function reverse(pair) {
    return [pair[1], pair[0]];
  }


  function update_data_model(_) {
    data = _;
    if (data != null) {
      pts_loc = data.get('pts_loc');
      pts = data.get('pts');
      pts_idx = data.get('pts_idx');
      pts_extent = data.get('pts_extent');
      attrs = data.get('attrs');
      attrs_idx = data.get('attrs_idx');
      attrs_extent = data.get('attrs_extent');
      partitions = new Map( data.get('partitions').map(p => [p.id, new Partition(p, pts_loc)]));
      filtered = Array(pts_idx.length).fill(false);

      measure = data.get('measure');
      measure_idx = attrs_idx.indexOf(measure);
    } else {
      pts = null;
      pts_idx = [];
      pts_extent = [];
      attrs = null;
      attrs_idx = [];
      attrs_extent = [];
      partitions = new Map();
      measure = '';
      measure_idx = -1;
    }
    inverse = new Map();
    root.select('.rg_measure').text(measure);
  }

  function update_cols() {
    cols = pts_idx.map( (c,i) => ({idx: i, name: c}));
    root.select('.rg_bottom_scroll').style('width', `${cols.length*(PLOT_WIDTH + 2*PLOT_BORDER + PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_rows() {
    rows = show.sort((a,b) => a -b).map((r, i) => ({
      idx: i,
      id: r,
      size:partitions.get(r).index.length,
      bar: show_info.has(r) && show_info.get(r).intercept
    }));
    root.select('.rg_right_scroll').style('height', `${rows.length*(ROW_HEIGHT + 2*PLOT_BORDER + PLOT_GAP) - PLOT_GAP}px`);
  }

  function get_pt(idx) {
    let pt = [];
    let n = pts.shape[1];
    for (let i=0; i<n; i++) {
      pt.push(pts.get(idx, i));
    }
    return pt;
  }

  function minmax([x0, x1], coef){
    let v = [x0*coef, x1*coef];
    if (v[0] > v[1]) v = [v[1], v[0]];
    return v;
  }

  function compute_ranges(row) {
    let ranges = [];
    let info = show_info.get(row.id);
    for (let col of cols) {
      ranges.push(minmax(pts_extent[col.idx], info.coef[col.idx]))
    }

    let v_min = ranges.reduce( (a, v) => a + v[0], info.intercept);
    let v_max = ranges.reduce( (a, v) => a + v[1], info.intercept);

    return { v_min, v_max, ranges}

  }

  function update_plots() {
    plots = [];
    for (let row of rows) {
      let partition = partitions.get(row.id);
      // let model_info = show_model && show_info.has(row.id) ? compute_ranges(row) : null;
      for (let col of cols) {
        let model = null;
        // if (model_info) {
        //   let info = show_info.get(row.id);
        //   let [x0, x1] = pts_extent[col.idx];
        //   let y_min = model_info.v_min;
        //   let y_max = model_info.v_max;
        //   let r = model_info.ranges[col.idx];
        //   model = [
        //     {x0: x0, y0: y_min, x1: x0, y1: y_min - r[0] + r[1]},
        //     {x0: x1, y0: y_min, x1: x1, y1: y_max - r[0] + r[1]}
        //   ];
        // }
        let p = {
           id: row.id,
           row: row.idx,
           col: col.idx,
           partition: partition,
           // data for plot
           width: PLOT_WIDTH,
           height: PLOT_HEIGHT,
           x_extent: pts_extent[col.idx],
           y_extent: attrs_extent[measure_idx],
           x: pts,
           y: attrs,
           pts_idx: partition.index,
           x_dim: col.idx,
           y_dim: measure_idx,
           c_dim: color_idx,
           filtered: filtered,
           color: colorScale,
           model: model,
           inverse: show_inverse && inverse.has(row.id) && inverse.get(row.id)[col.idx],
           bar: show_info.has(row.id) && show_info.get(row.id).n_coef[col.idx]
         };
         plots.push(p);
      }
    }
  }

  function change_order(d) {
    console.log('change order', d);
  }

  function render() {
    // console.log('details render');
    let t0 = performance.now();
    render_cols();
    render_rows();
    render_plots();
    let t1 = performance.now();
    if (t1-t0 > 1000)
      console.log(`details rendering: ${t1-t0} msec`);
  }

  function render_cols() {
    let d3cols = root.select('.rg_top').selectAll('.rg_col_header').data(cols, d => d.idx);
    d3cols.enter()
      .append('div')
      .classed('rg_col_header', true)
      .on('click', change_order)
    .merge(d3cols)
      .html(d => d.name);

    d3cols.exit()
      // .transition().duration(DURATION)
      // .style('opacity', 0)
      .remove();
  }

  function render_rows() {
      let d3rows = root.select('.rg_left').selectAll('.rg_row_header').data(rows, d => d.id);
      let enter = d3rows.enter()
        .append('div')
        .classed('rg_row_header', true)
        .on('click', on_select)
        .on('mouseenter', on_enter)
        .on('mouseleave', on_leave)
        .style('opacity',1)
        .html(row_header_template);

      let merge = enter.merge(d3rows);

      merge.select('.info')
        .classed('highlight', d => d.id === highlighted);

      merge.select('.id')
        .html(d => d.id);

      merge.select('.size')
        .html(d => d.size);

      merge.select('.bar')
        .style('width', d => `${Math.round(Math.abs(d.bar) * 100)}%`)
        .style('background', d => d.bar > 0 ? 'lightgreen' : 'lightcoral');


      d3rows.exit()
        // .transition().duration(DURATION)
        // .style('opacity', 0)
        .remove();
  }

  function render_plots() {
    // console.log('details render plots');
    let d3plots = root.select('.rg_plots').selectAll('.rg_plot_item')
      .data(plots, d => [d.partition.id, d.col])
      .join(
        enter => {
          let items = enter.append('div')
            .classed('rg_plot_item', true)
            .style('opacity', 1)
            .on('mouseenter', on_enter)
            .on('mouseleave', on_leave)
            .style('left', d => `${d.col * (PLOT_WIDTH + 2 * PLOT_BORDER + PLOT_GAP)}px`)
            .style('top', d => `${d.row * (ROW_HEIGHT + 2 * PLOT_BORDER + PLOT_GAP)}px`);

          items
            .append('div')
            .classed('rg_plot', true)
            .call(plot_renderer.create)
            .call(plot_renderer.render);

          items
            .append('div')
            .classed('rg_bar_item', true)
            .style('width', d => `${Math.round(Math.abs(d.bar) * 100)}%`)
            .style('background', d => d.bar > 0 ? 'lightgreen' : 'lightcoral');
          return items;
        },
        update => {
          update
            .style('left', d => `${d.col * (PLOT_WIDTH + 2 * PLOT_BORDER + PLOT_GAP)}px`)
            .style('top', d => `${d.row * (ROW_HEIGHT + 2 * PLOT_BORDER + PLOT_GAP)}px`);

          update.select('.rg_plot')
            .call(plot_renderer.render);

          update.select('.rg_bar_item')
            .style('width', d => `${Math.round(Math.abs(d.bar) * 100)}%`)
            .style('background', d => d.bar > 0 ? 'lightgreen' : 'lightcoral');

          return update;
        },
        exit => exit.remove()
      );
  }


  function scroll_plots() {
    let left = root.select('.rg_bottom').node().scrollLeft;
    root.select('.rg_top').node().scrollLeft = left;
    root.select('.rg_plots').node().scrollLeft = left;

    let top = root.select('.rg_right').node().scrollTop;
    root.select('.rg_left').node().scrollTop = top;
    root.select('.rg_plots').node().scrollTop = top;
  }

  function on_select(d) {
    let selected = show.concat();
    let idx = selected.indexOf(d.id);
    if (idx === -1) selected.push(d.id);
    else selected.splice(idx, 1);
    model.set('show', selected);
    sync();
  }

  let highlight_timer = null;

  function on_enter(d) {
    if (highlight_timer) {
      clearTimeout(highlight_timer);
      highlight_timer = null;
    }
    model.set('highlight', d.id);
    sync();
  }

  function on_leave(d) {
    highlight_timer = setTimeout( leave, 250, this, arguments);
  }

  function leave(self, args) {
    highlight_timer = null;
    model.set('highlight', -2);
    sync();
  }

  let resize_timer = null;

  function trigger_resize() {
    resize_timer = null;
    render();
  }


  return {
    el(_) {
      root = _;

      root.select('.rg_bottom').on('scroll', scroll_plots);
      root.select('.rg_right').on('scroll', scroll_plots);

      return this;
    },

    resize() {
       if (resize_timer)
        clearTimeout(resize_timer);
      resize_timer = setTimeout( trigger_resize, 250);
      return this;
    },

    model(_) {
      set_model(_);
      return this;
    },

    redraw() {
      render();
      return this;
    }
  };
}
