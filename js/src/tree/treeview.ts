import {
  DOMWidgetView
} from "@jupyter-widgets/base";

import {
   Message
} from '@phosphor/messaging';

import * as d3 from 'd3';

import Panel from './panel';

import './tree.css';
import * as template from './tree.html';

export
class TreeView extends DOMWidgetView {

  initialize(parameters) {
    super.initialize(parameters);
  }
  render() {
    this.d3el = d3.select(this.el)
      .classed('rg_tree', true);

    this.d3el.html(template);
    this.panel = Panel().el(d3.select(this.el).select('.view'));

    this.model.get('tree').on('change:tree', this.on_tree_updated, this);
    this.model.get('tree').on('change', this.on_tree_updated, this);

    this.model.on('change:title', this.on_title_changed, this);
    this.model.on('change:field', this.on_field_changed, this);
    this.model.on('change:tree', this.on_tree_changed, this);
    this.model.on('change:attrs', this.on_attrs_changed, this);

    this.on_title_changed();
    this.on_field_changed();
    let self = this;
    setTimeout( function() {
      self.panel.resize();
      self.on_tree_changed();
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



  on_tree_changed() {
    console.log('tree changed:', this.model.get('tree'), this.model.previous('tree'));
    let prev = this.model.previous('tree');
    if (prev) {
      prev.off('change', this.on_tree_updated, this);
    }
    let current = this.model.get('tree');
    if (current) {
      current.on('change', this.on_tree_updated, this);
    }
    this.on_tree_updated()
  }

  on_tree_updated() {
    console.log('tree updated', this.model.get('tree').get('root'));
    this.panel.data(this.model.get('tree').get('root'));
  }

  on_title_changed() {
    this.d3el.select('.title').text(this.model.get('title'));
  }

  on_field_changed() {
    this.panel.field(this.model.get('field'));
  }

  on_attrs_changed() {
    console.log('attrs changed');
  }

  d3el: any;
  panel: any;
  tree: any;
}
