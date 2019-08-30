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
  let pts = [];


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
    start_x = d.sx(1);
    start_y = d.sy(1);
  }

  function axisDrag(d) {
    let dx = d3.event.x - drag_x;
    let dy = d3.event.y - drag_y;

    let x = start_x + dx;
    let y = start_y + dy;
    d.theta = Math.atan2(y, x );
    d.len = Math.sqrt(x*x + y*y);
    d.sx.range([0, d.len*cos(d.theta)]);
    d.sy.range([0, d.len*sin(d.theta)]);

    project();
    render();
  }

  function axisDragEnd() {

  }

  function render() {
    render_axes();
    render_pts();
  }

  function render_axes() {
    let o = svg.select('.pts').selectAll('.origin').data([0, 0]);
    o.enter()
        .append('circle')
        .attr('class', 'origin')
        .attr('r', 3)
      .merge(o)
        .attr('cx', 0)
        .attr('cy', 0);

    let a = svg.select('.axes').selectAll('.axis').data(axes, d => d.name);
    a.enter()
      .append('line')
        .attr('class', 'axis')
        .attr("marker-end", "url(#arrowhead-end)")
      .merge(a)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', d => d.sx(1))
        .attr('y2', d => d.sy(1));
    a.exit().remove();

    let names = svg.select('.labels').selectAll('.label').data(axes, d => d.name);
    names.enter()
      .append('text')
        .attr('class', 'label')
        .text(d => d.name)
        .call(drag)
      .merge(names)
        .attr('x', d => d.sx(1)+10)
        .attr('y', d => d.sy(1));

    names.exit().remove();
  }

  function project() {
    let d = axes.length;
    for (let pt of pts) {
      let x = 0, y = 0;
      for (let i=0; i<d; i++) {
        let a = axes[i];
        x += a.sx(pt.value[i]);
        y += a.sy(pt.value[i]);
      }
      pt.x = x;
      pt.y = y;
    }
  }

  function render_pts() {
    let p = svg.select('.pts').selectAll('.pt').data(pts);
    p.enter()
      .append('circle')
      .attr('class', 'pt')
      .attr('r', 3)
      .merge(p)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    p.exit().remove();
  }

  function setup() {
    svg = root.select('svg');
      let g = svg.append('g')
        .attr('transform', `translate(100,100)`);

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
  return {
    el(_) {
      root = _;
      setup();
      return this;
    },

    axes(_) {
      axes = _;
      let n = _.length;
      let r = 30;
      let angle = n === 2 ? PI/2 : 2*PI/n;
      axes = _.map( (a, i) => {
        let theta = angle * i;
        console.log(`axis ${a.name}: ${a.min}..${a.max}`);
        return {
          name: a.name,
          min: a.min,
          max: a.max,
          theta: theta,
          len: r,
          sx: d3.scaleLinear().domain([0, a.max]).range([0, r * cos(theta)]),
          sy: d3.scaleLinear().domain([0, a.max]).range([0, r * sin(theta)])
        };
      });

      render();
    },

    pts(_) {
      pts = _;
      project();
      render();
      return this;
    },

    resize() {
      let w = parseInt(svg.style('width')) ;
      let h = parseInt(svg.style('height'));
      svg.select('g')
        .attr('transform', `translate(${w/2},${h/2})`);
      project();
      render();
      return this;
    },

    redraw() {
      render();
      return this;
    }
  }
}