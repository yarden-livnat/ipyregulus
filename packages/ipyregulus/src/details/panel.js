import * as d3 from 'd3';
import * as chromatic from 'd3-scale-chromatic';

import {
  Partition
} from '../models/partition';
import Plot from './plot';
import './panel.css';

// let DEFAULT_WIDTH = 800;
// let DEFAULT_HEIGHT = 500;

let PLOT_WIDTH = 100;
let PLOT_HEIGHT = 100;
let PLOT_BORDER = 1;
let PLOT_GAP = 5;


export default function Panel() {
  // let margin = {top: 10, right: 30, bottom: 50, left:60},
  // width = DEFAULT_WIDTH - margin.left - margin.right,
  // height = DEFAULT_HEIGHT - margin.top - margin.bottom;

  let root = null;
  let svg = null;

  let data = null;
  let pts_loc = null;
  let pts = null;
  let pts_idx = [];
  let pts_extent = [];
  let attrs = null;
  let attrs_idx = [];
  let attrs_extent = [];
  let partitions = new Map();

  let measure_name = '';
  let measure_idx = 0;
  let show = [];
  let filtered = [];

  let initial_cmap = 'RdYlBu';
  let colorScale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);
  let color_idx = measure_idx;

  let cols = [];
  let rows = [];
  let plots = [];

  let plot_renderer =  Plot();

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
      measure_name = data.get('measure');
      measure_idx = attrs_idx.indexOf(measure_name);

      color_idx = measure_idx;
      colorScale.domain(attrs_extent[color_idx]);
      filtered = Array(pts_idx.length).fill(false);
      // filtered.fill(true, filtered.length/2);
    } else {
      pts = null;
      pts_idx = [];
      pts_extent = [];
      attrs = null;
      attrs_idx = [];
      attrs_extent = [];
      partitions = new Map();
      measure_name = ''
    }
  }

  function update_cols() {
    cols = pts_idx.map( (c,i) => ({id: i, name: c}));
    root.select('.rg_bottom_scroll').style('width', `${cols.length*(PLOT_WIDTH + 2*PLOT_BORDER + PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_rows() {
    rows = show.map((r, i) => ({id: i, idx: r}));
    root.select('.rg_right_scroll').style('height', `${rows.length*(PLOT_HEIGHT + 2*PLOT_BORDER + PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_plots() {
    plots = [];
    for (let row of rows) {
      let partition = partitions.get(row.idx);
      for (let col of cols) {
         let p = {
           row: row.id,
           col: col.id,
           partition: partition,
           // data for plot
           width: PLOT_WIDTH,
           height: PLOT_HEIGHT,
           x_extent: pts_extent[col.id],
           y_extent: attrs_extent[measure_idx],
           x: pts,
           y: attrs,
           pts_idx: partition.index(),
           x_dim: col.id,
           y_dim: measure_idx,
           c_dim: color_idx,
           filtered: filtered,
           color: colorScale
         }
         plots.push(p);
      }
    }
  }

  function render() {
    render_cols();
    render_rows();
    render_plots();
  }

  function render_cols() {
    let d3cols = root.select('.rg_top').selectAll('.rg_col_header').data(cols, d => d.id);
    d3cols.enter()
      .append('div')
      .classed('rg_col_header', true)
    .merge(d3cols)
      .html(d => d.name);

    d3cols.exit().remove();
  }

  function render_rows() {
      let d3rows = root.select('.rg_left').selectAll('.rg_row_header').data(rows, d => d.id);
      d3rows.enter()
        .append('div')
        .classed('rg_row_header', true)
      .merge(d3rows)
        .html(d => d.id);

      d3rows.exit().remove();
  }

  function render_plots() {
      let d3plots = root.select('.rg_plots').selectAll('.rg_plot').data(plots);
      d3plots.enter()
        .append('div')
        .classed('rg_plot_item', true)
        .call(plot_renderer.create)
      .merge(d3plots)
        .style('left', d => `${d.col*(PLOT_WIDTH + 2*PLOT_BORDER + PLOT_GAP)}px`)
        .style('top', d => `${d.row*(PLOT_HEIGHT + 2*PLOT_BORDER + PLOT_GAP)}px`)
        .call(plot_renderer.render)
  }


  function scroll_plots() {
    let left = root.select('.rg_bottom').node().scrollLeft;
    root.select('.rg_top').node().scrollLeft = left;
    root.select('.rg_plots').node().scrollLeft = left;

    let top = root.select('.rg_right').node().scrollTop;
    root.select('.rg_left').node().scrollTop = top;
    root.select('.rg_plots').node().scrollTop = top;
  }


  // let resizeObserver = new ResizeObserver(entries => {
  //       entries.forEach( e => {
  //         console.log('resize:', e.target, e.contentRect.width, e.contentRect.height);
  //       });
  //   }
  // );

  let panel = {
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

    data(_) {
      update_data_model(_);
      update_cols();
      update_rows();
      update_plots();
      render();
      return this;
    },

    show(_) {
      show = _;
      update_rows();
      update_plots();
      render();
      return this;
    },

    redraw() {
      render();
      return this;
    }
  }

  return panel;
}
