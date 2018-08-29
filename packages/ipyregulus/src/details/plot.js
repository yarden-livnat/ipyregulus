import * as d3 from 'd3';


export default function Plot() {
  let margin = {top: 2, right: 2, bottom: 2, left: 2}
  let pt_size = 2;
  let canvas_draw_circles = false;

  // let brush = d3.brush().extent([[0, 0], [width, height]])
  let sx = d3.scaleLinear();
  let sy = d3.scaleLinear();

  function render_canvas(selection) {
    selection.each(function(d, i) {
      sx.domain(d.x_extent).range([margin.left, d.width-margin.right]);
      sy.domain(d.y_extent).range([d.height-margin.top, margin.bottom]);

      let bg_ctx = d3.select(this).select('.rg_plot_canvas-bg').node().getContext('2d');
      let fg_ctx = d3.select(this).select('.rg_plot_canvas-fg').node().getContext('2d');

      bg_ctx.save();
      bg_ctx.fillStyle = 'white';
      bg_ctx.strokeStyle = 'black';
      bg_ctx.fillRect(0, 0, d.width, d.height);
      // bg_ctx.strokeRect(0, 0,  d.width, d.height);

      fg_ctx.save();
      fg_ctx.clearRect(0, 0, d.width, d.height);

      // let cctx = ctx.get(this);
      // let tx = pt => cctx.sx(pt[cctx.name]);
      // let ty = y.get(this);
      //
      bg_ctx.fillStyle = '#eee';
      for (let idx of d.pts_idx) {
        let px = sx(d.x.get(idx, d.x_dim));
        let py = sy(d.y.get(idx, d.y_dim));
        if (!d.filtered[idx]) {
          fg_ctx.fillStyle = d.color(d.y.get(idx, d.c_dim));
          draw_shape(fg_ctx, px, py, pt_size);
        } else { //if (show_filtered === 'all' || show_filtered === cctx.name) {
          draw_shape(bg_ctx, px, py, pt_size);
        }
      }

      bg_ctx.restore();
      fg_ctx.restore();
    });
  }

  function draw_shape(ctx, x, y, r) {
    if (canvas_draw_circles) {
      ctx.beginPath();
      ctx.arc(x, y, pt_size, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, pt_size, pt_size);
    }
  }

  let plot = {
    create(selection) {
      selection.classed('rg_plot', true);
      selection.append('canvas')
        .attr('class', 'rg_plot_canvas-bg')
        .attr('width', d => d.width)
        .attr('height', d => d.height);

      selection.append('canvas')
        .attr('class', 'rg_plot_canvas-fg')
        .attr('width', d => d.width)
        .attr('height', d => d.height);

      let svg = selection.append('svg')
        .attr('class', 'rg_plot_svg')
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      svg.append('path').attr('class', 'rg_plot_area');
      svg.append('g').attr('class', 'rg_plot_pts');
      svg.append('path').attr('class', 'rg_plot_line');
      // svg.append('g')
      //    .attr('class', 'brush')
      //    .call(brush);
    },

    render(selection) {
      selection.select('svg')
        .each( function(d, i) {
          let svg = d3.select(this);
          // show regression curve and area
      });

      selection.call(render_canvas);
    }
  };

  return plot;
}
