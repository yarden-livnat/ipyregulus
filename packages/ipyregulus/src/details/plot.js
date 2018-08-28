import * as d3 from 'd3';


export default function Plot() {

  let plot = {

    render(selection) {
      selection.each( function(d, i) {
        d3.select(this)
          .html(d => `[${d.row},${d.col}]`);
      });
    }
  };

  return plot;
}
