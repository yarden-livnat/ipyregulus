import * as d3 from 'd3';

import {
  Partition
} from '../models/partition';

import './panel.css';
import * as chromatic from "d3-scale-chromatic";

export default function Panel(ctrl) {
  let root = null;
  let svg = null;

  let model = null;
  let data = null;
  let show = [];

  let measure_name = null;
  let current_measure = null;
  let measure_idx = 0;

  let pts_loc = null;
  let pts = null;
  let pts_idx = [];
  let pts_extent = [];
  let attrs = null;
  let attrs_idx = [];
  let attrs_extent = [];

  let color_idx = 0;
  let colorScale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);

  let axes = [];
  let origin = [100, 100];

  let partitions = new Map();

  function set_model(_){
    model = _;
    model.on('change:data', model_changed);
    model.on('change:measure', measure_changed);
    model.on('change:show', show_changed);
    measure_changed();
    model_changed();
    show_changed();
  }

  function model_changed() {
    update_data_model(model.get('data'));
    update_measure();
    render();
  }

  function measure_changed() {
    measure_name = model.get('measure');
    update_measure();
    render();
  }

  function show_changed() {
    show = model.get('show');
    render();
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
    } else {
      pts = null;
      pts_idx = [];
      pts_extent = [];
      attrs = null;
      attrs_idx = [];
      attrs_extent = [];
    }
  }

  function update_measure() {
    let name = measure_name;
    if (name == null && data != null)
      name = data.get('measure');
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


  function render() {
    render_axes();
  }

  function render_axes() {
    let o = root.select('.origin').data([origin]);
    o.enter()
        .append('circle')
        .attr('class', 'origin')
        .attr('r', 3)
      .merge(o)
      .attr('x', d => d[0])
      .attr('y', d => d[1])
  }

  return {
    el(_) {
      root = _;
      return this;
    },

    resize() {
      let w = parseInt(svg.style('width')) || DEFAULT_WIDTH;
      let h = parseInt(svg.style('height')) || DEFAULT_HEIGHT;
      console.log(`projection resize ${w}x${h}`);
      origin = [w/2, h/2];
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
  }
}