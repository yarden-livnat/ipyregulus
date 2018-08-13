import {
  DOMWidgetView
} from "@jupyter-widgets/base";

import {
  ConflatableMessage, IMessageHandler, Message, MessageLoop
} from '@phosphor/messaging';

import * as d3 from 'd3';

import Panel from './panel';

import './tree.css';
import * as template from './tree.html';

export
class Tree extends DOMWidgetView {
  render() {
    this.d3el = d3.select(this.el)
      .classed('rg_tree', true);

    this.d3el.html(template);
    this.panel = Panel().el(d3.select(this.el).select('.view'));
    this.model.on('change:title', this.on_title_changed, this);
    this.model.on('change:field', this.on_field_changed, this);
    this.model.on('change:tree', this.on_data_changed, this);

    this.on_title_changed();
    this.on_field_changed();
    let self = this;
    setTimeout( function() {
      self.panel.resize();
      self.on_data_changed();
      },
    0);

  }

  processPhosphorMessage(msg:Message) {
    // console.log('Tree phosphor message', msg);
    switch (msg.type) {
      case 'after-attach':
        d3.select(this.el.parentNode).classed('rg_output', true);
        break;
      case 'resize':
        this.panel.resize();
        break;
    }
  }

  // events(): {[e: string]: string} {
  //   // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
  //   return {'click': '_handle_click'};
  // }
  //
  // _handle_click(event) {
  //   event.preventDefault();
  //   this.touch();
  // }

  on_title_changed() {
    this.d3el.select('.title').text(this.model.get('title'));
  }

  on_field_changed() {
    this.panel.field(this.model.get('field'));
  }

  on_data_changed() {
    this.panel.data(this.model.get('tree'));
  }

  d3el: any;
  panel: any;
}
