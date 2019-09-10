import * as d3 from 'd3';
import * as chromatic from 'd3-scale-chromatic';

import {
  Partition
} from '../models/partition';

import Plot from './plot';
import './panel.css';
import row_header_template from './row_header.html';

// let DEFAULT_WIDTH = 800;
// let DEFAULT_HEIGHT = 500;

let PLOT_WIDTH = 100;
let PLOT_HEIGHT = 100;
let PLOT_BORDER = 1;
let PLOT_GAP = 5;

let DURATION = 1000;

export default function Panel(ctrl) {
  // let margin = {top: 10, right: 30, bottom: 50, left:60},
  // width = DEFAULT_WIDTH - margin.left - margin.right,
  // height = DEFAULT_HEIGHT - margin.top - margin.bottom;

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

  let measure_name = null;
  let current_measure = null;
  let measure_idx = 0;
  let show = [];
  let filtered = [];
  let highlighted = -2;

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
    model.on('change:measure', measure_changed);
    model.on('change:show', show_changed);
    model.on('change:highlight', highlight_changed);
    measure_changed();
    model_changed();
    show_changed();
  }

  function model_changed() {
    update_data_model(model.get('data'));
    update_measure();
    update_cols();
    update_rows();
    update_plots();
    render();
  }

  function measure_changed() {
    measure_name = model.get('measure');
    update_measure();
    update_plots();
    render();
  }

  function show_changed() {
    show = model.get('show');
    update_rows();
    update_plots();
    render();
  }

  function highlight_changed() {
    highlighted = model.get('highlight');
    render();
  }

  function update_measure() {
    let name = measure_name;
    if (name == null && data != null)
        name = data.get('measure');
    // if (name === current_measure) return;

    current_measure = name || '';
    if (current_measure !== '' && data) {
      measure_idx = attrs_idx.indexOf(current_measure);

      color_idx = measure_idx;
      colorScale.domain(attrs_extent[color_idx]);
    } else {
      measure_idx = null;
      color_idx = null;
    }
    root.select('.rg_measure').text(current_measure);
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
    } else {
      pts = null;
      pts_idx = [];
      pts_extent = [];
      attrs = null;
      attrs_idx = [];
      attrs_extent = [];
      partitions = new Map();
    }
  }

  function update_cols() {
    cols = pts_idx.map( (c,i) => ({idx: i, name: c}));
    root.select('.rg_bottom_scroll').style('width', `${cols.length*(PLOT_WIDTH + 2*PLOT_BORDER + PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_rows() {
    rows = show.sort((a,b) => a -b).map((r, i) => ({idx: i, id: r}));
    root.select('.rg_right_scroll').style('height', `${rows.length*(PLOT_HEIGHT + 2*PLOT_BORDER + PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_plots() {
    plots = [];
    for (let row of rows) {
      let partition = partitions.get(row.id);
      for (let col of cols) {
         let p = {
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
           pts_idx: partition.index(),
           x_dim: col.idx,
           y_dim: measure_idx,
           c_dim: color_idx,
           filtered: filtered,
           color: colorScale
         };
         plots.push(p);
      }
    }
  }

  function render() {
    let t0 = performance.now();
    render_cols();
    render_rows();
    render_plots();
    let t1 = performance.now();
    console.log(`details rendering: ${t1-t0} msec`);
  }

  function render_cols() {
    let d3cols = root.select('.rg_top').selectAll('.rg_col_header').data(cols, d => d.idx);
    d3cols.enter()
      .append('div')
      .classed('rg_col_header', true)
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
        .style('opacity', 0)
        .html(row_header_template);

      let merge = enter.merge(d3rows);

      merge
        .classed('highlight', d => d.id == highlighted)
        .transition().duration(DURATION).style('opacity', 1);

      merge.select('.id')
        .html(d => d.id);

      // merge.select('.parent')
      //   .html(d => d.parent);


      d3rows.exit()
        // .transition().duration(DURATION)
        // .style('opacity', 0)
        .remove();
  }

  function render_plots() {
      let d3plots = root.select('.rg_plots').selectAll('.rg_plot').data(plots, d => [d.partition.id, d.col]);
      let list = d3plots.enter()
        .append('div')
        .classed('rg_plot_item', true)
        .style('opacity', 0)
        .call(plot_renderer.create)
      .merge(d3plots)
        .style('left', d => `${d.col*(PLOT_WIDTH + 2*PLOT_BORDER + PLOT_GAP)}px`)
        .style('top', d => `${d.row*(PLOT_HEIGHT + 2*PLOT_BORDER + PLOT_GAP)}px`)
        .call(plot_renderer.render);

      list.transition().duration(DURATION)
        // .style('top', d => `${d.row*(PLOT_HEIGHT + 2*PLOT_BORDER + PLOT_GAP)}px`)
        .style('opacity', 1);

      d3plots.exit()
        // .transition().duration(DURATION)
        // .style('opacity', 0)
        .remove();
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
    if (idx == -1) selected.push(d.id);
    else selected.splice(idx, 1);
    model.set('show', selected);
    sync();
  }

  function on_enter(d) {
    model.set('highlight', d.id);
    sync();
  }

  function on_leave(d) {
    model.set('highlight', -2);
    sync();
  }

  // let resizeObserver = new ResizeObserver(entries => {
  //       entries.forEach( e => {
  //         console.log('resize:', e.target, e.contentRect.width, e.contentRect.height);
  //       });
  //   }
  // );

  return {
    el(_) {
      root = _;

      root.select('.rg_bottom').on('scroll', scroll_plots);
      root.select('.rg_right').on('scroll', scroll_plots);

      // resizeObserver.observe(root.select('.rg_top').node());
      // resizeObserver.observe(root.select('.rg_left').node());

       // svg = _;
      //
      // let g = svg.append('g')
      //   .attr('transform', `translate(${margin.left},${margin.top})`);

      return this;
    },

    resize() {
      // if (!svg) return;
      //
      // let w = parseInt(svg.style('width')) || DEFAULT_WIDTH;
      // let h = parseInt(svg.style('height')) || DEFAULT_HEIGHT;
      // width =  w -margin.left - margin.right;
      // height = h - margin.top - margin.bottom ;

      render();
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
