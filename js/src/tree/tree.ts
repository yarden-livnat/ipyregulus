import {
  DOMWidgetView
} from "@jupyter-widgets/base";

import * as d3 from 'd3';

import Panel from './panel';

import './tree.css';
import * as template from './tree.html';

export
class Tree extends DOMWidgetView {
  render() {
    this.d3el = d3.select(this.el);
    this.d3el.html(template);
    this.panel = Panel();
    this.model.on('change:title', this.title_updated, this);
    this.model.on('change:field', this.data_updated, this);
    this.model.on('change:root', this.data_updated, this);

    this.title_updated();
    let self = this;
    setTimeout( function() {  
      d3.select(self.el).select('.view').call(self.panel);
      self.data_updated();
      self.draw();
      },
    0);

  }

  events(): {[e: string]: string} {
    // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
    return {'click': '_handle_click'};
  }

  _handle_click(event) {
    event.preventDefault();
    this.model.set('field', this.model.get('field')+'.1');
    this.touch();
  }

  title_updated() {
    this.d3el.select('.title').text(this.model.get('title'));
  }

  data_updated() {
    console.log('tree data updated');
    this.panel.data(this.model.get('root'));
    d3.select(this.el).select('.view').call(this.panel);
  }

  draw() {
    console.log('Tree:', this.model.get('title'), 'field:', this.model.get('field'));
  }

  // el: HTMLButtonElement;
  d3el: any;
  panel: any;
}
