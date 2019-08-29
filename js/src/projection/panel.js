import * as d3 from 'd3';
const {cos, sin, PI} = Math;

import './panel.css';
import * as chromatic from "d3-scale-chromatic";

export default function Panel() {
  let root = null;
  let svg = null;

  let initial_cmap = 'RdYlBu';
  let colorScale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);

  let axes = [];
  let origin = [100, 100];

  let defs = [
  {id: 'arrowhead-start', path: "M10,-5L0,0L10,5", box: "0 -5 10 10", color: '#aaa', refx: 0, refy: 0 },
  {id: 'arrowhead-end', path: "M0,-5L10,0L0,5", box: "0 -5 10 10", color: '#ccc', refx: 0, refy: 0}
];

  function render() {
    render_axes();
  }

  function render_axes() {
    let o = svg.select('.pts').selectAll('.origin').data([origin]);
    o.enter()
        .append('circle')
        .attr('class', 'origin')
        .attr('r', 3)
      .merge(o)
      .attr('cx', d => d[0])
      .attr('cy', d => d[1]);

    let a = svg.select('.axes').selectAll('.axis').data(axes, d => d.name);
    a.enter()
      .append('line')
        .attr('class', 'axis')
        .attr("marker-end", "url(#arrowhead-end)")
      .merge(a)
        .attr('x1', origin[0])
        .attr('y1', origin[1])
        .attr('x2', d => origin[0] + d.len * cos(d.theta))
        .attr('y2', d => origin[1] + d.len * sin(d.theta));

    let names = svg.select('.axes').selectAll('.name').data(axes, d => d.name);
    names.enter()
      .append('text')
        .attr('class', 'label')
        .text(d => d.name)
      .merge(names)
        .attr('x', d => origin[0] + (d.len+10) * cos(d.theta))
        .attr('y', d => origin[1] + (d.len+10) * sin(d.theta));
  }

  return {
    el(_) {
      root = _;
      svg = root.select('svg');
      // let g = svg.append('g');

      svg.append('g')
        .attr('class', 'axes');

      svg.append('g')
        .attr('class', 'pts');

      svg.append('g')
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
      return this;
    },

    axes(_) {
      axes = _;
      let n = _.length;
      axes = _.map( (a, i) => ({
        name: a.name,
        min: a.min,
        max: a.max,
        theta: 2 * PI * i/ n,
        len: 30
      }));

      render();
    },

    resize() {
      let w = parseInt(svg.style('width')) ;
      let h = parseInt(svg.style('height'));
      console.log(`projection resize ${w}x${h}`);
      origin = [w/2, h/2];
      render();
      return this;
    },

    redraw() {
      render();
      return this;
    }
  }
}