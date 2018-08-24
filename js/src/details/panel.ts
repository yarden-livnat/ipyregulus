import * as d3 from 'd3';
import './panel.css';

let DEFAULT_WIDTH = 800;
let DEFAULT_HEIGHT = 500;

export default function Panel() {
  let margin = {top: 10, right: 30, bottom: 50, left:60},
  width = DEFAULT_WIDTH - margin.left - margin.right,
  height = DEFAULT_HEIGHT - margin.top - margin.bottom;

  let root = null;
  let svg = null;

  let data = null;
  let measure = '';
  let show = [];

  function render() {
    if (!svg) return;

  }

  function scroll_plots() {
    let left = root.select('.rg_bottom').node().scrollLeft;
    root.select('.rg_top').node().scrollLeft = left;
    root.select('.rg_plots').node().scrollLeft = left;

    let top = root.select('.rg_right').node().scrollTop;
    root.select('.rg_left').node().scrollTop = top;
    root.select('.rg_plots').node().scrollTop = top;
  }

  let panel = {
    el(_) {
      root = _;

      root.select('.rg_bottom').on('scroll', scroll_plots);
      root.select('.rg_right').on('scroll', scroll_plots);

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
      data = _;
      return this;
    },

    measure(_) {
      measure = _;
      return this;
    },

    show(_) {
      show = _;
    },

    redraw() {
      render();
      return this;
    }
  }

  return panel;
}
