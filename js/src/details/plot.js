import * as d3 from 'd3';


export default function Plot() {
  let margin = {top: 2, right: 2, bottom: 2, left: 2};
  let pt_size = 2;
  let canvas_draw_circles = false;

  // let brush = d3.brush().extent([[0, 0], [width, height]])
  let sx = d3.scaleLinear();
  let sy = d3.scaleLinear();

  function render(d, i) {
    let root = d3.select(this);
    sx.domain(d.x_extent).range([margin.left, d.width-margin.right]);
    sy.domain(d.y_extent).range([d.height-margin.top, margin.bottom]);
    render_canvas(root, d, i);
    render_svg(root, d, i);
    // selection.call(render_canvas);
    // selection.call(render_svg);
  }

  function render_canvas(root, d, i) {
    let bg_ctx = root.select('.rg_plot_canvas-bg').node().getContext('2d');
    let fg_ctx = root.select('.rg_plot_canvas-fg').node().getContext('2d');

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
      // console.log(`pt ${idx}  c_dim: ${d.c_dim}   v=${d.y.get(idx, d.c_dim)}  c=${d.color(d.y.get(idx, d.c_dim))}`);
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

  function render_svg(root, d, i) {
    let svg = root.select('svg');

    if (d.inverse) {
      let inverse = d3.line()
        .x(p => sx(p[1])).y(p => sy(p[0]));

      let area = d3.area()
        .x0(p => sx(p[1] - p[2]))
        .y0(p => sy(p[0]))
        .x1(p => sx(p[1] + p[2]))
        .y1(p => sy(p[0]));


      svg.select('.rg_plot_line')
        .attr('d', inverse(d.inverse));
      svg.select('.rg_plot_area')
        .attr('d', area(d.inverse));
    }

    if (d.model) {
      let area = d3.area()
        .x0(p => sx(p.x0))
        .y0(p => sy(p.y0))
        .x1(p => sx(p.x1))
        .y1(p => sy(p.y1));

      svg.select('.rg_plot_model')
        .attr('d', area(d.model));
    }
  }

  return {
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
        .append('g');
          // .attr('transform', `translate(${margin.left},${margin.top})`);

      svg.append('path').attr('class', 'rg_plot_area');
      svg.append('g').attr('class', 'rg_plot_pts');
      svg.append('path').attr('class', 'rg_plot_line');
      svg.append('path').attr('class', 'rg_plot_model');
      // svg.append('g')
      //    .attr('class', 'brush')
      //    .call(brush);
    },

    render(selection) {
      selection.each(render);
    }
  };
}
