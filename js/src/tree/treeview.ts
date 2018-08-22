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
    this.panel = Panel().el(d3.select(this.el).select('.view'))
      .on('details', (d, is_on) => this.on_details(d, is_on))
      .on('select', (d, is_on) => this.on_select(d, is_on));

    this.model.on('change:title', this.on_title_changed, this);
    this.model.on('change:field', this.on_field_changed, this);
    this.model.on('change:tree_model',  this.on_tree_changed, this);
    this.model.on('change:attrs', this.on_attrs_changed, this);
    this.model.on('change:show', this.on_show_changed, this);
    this.model.on('change:selected', this.on_selected_changed, this);
    this.model.on('change:details', this.on_details_changed, this);


    this.on_title_changed();

    let self = this;
    setTimeout( function() {
        self.panel.resize();
        self.on_attrs_changed();
        self.on_field_changed();
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
    let prev = this.model.previous('tree_model');
    if (prev) {
      prev.off('change:root', this.on_tree_updated, this);
      prev.off('change:attrs', this.on_tree_updated, this);
      prev.off('change:all', this.on_tree_updated, this);
    }
    let current = this.model.get('tree_model');
    if (current) {
      current.on('change:root', this.on_tree_updated, this);
      current.on('change:attrs', this.on_attrs_changed, this);
      current.on('change:all', this.on_tree_updated, this);
    }
    this.on_tree_updated();
  }

  on_title_changed() {
    this.d3el.select('.title').text(this.model.get('title'));
  }

  on_tree_updated() {
    this.panel.data(this.model.get('tree_model').get('root'))
      .redraw();
  }

  on_field_changed() {
    let field = this.model.get('field');
    this.d3el.select('.measure').html(field)
    this.panel.field(field)
      .redraw();
  }

  on_attrs_changed() {
    let attr = {
      ...this.model.get('tree_model').get('attrs'),
      ...this.model.get('attrs'),
    }
    this.panel.attrs(attr).redraw();
  }

  on_show_changed() {
    this.panel.show(this.model.get('show'))
      .redraw();
  }

  on_selected_changed() {
    console.log('seleted changed', this.model.get('selected'));
  }

  on_details_changed() {
    console.log('details changed', this.model.get('details'));
  }


  /*
   * events from Panel
   */

  on_select(node, is_on) {
    console.log('on select', this, node, is_on);
    if (is_on) {
      this.model.get('selected').add(node.id);
    } else {
      this.model.get('selected').delete(node.id);
    }
    this.touch();
  }

  on_details(node, is_on) {
    console.log('on details', node, is_on);
    if (is_on) {
      let details = this.model.get('details');
      // details.push(node.id);
      let d = new Set(details);
      d.add(node.id);
      this.model.set('details', d);
    } else {
      this.model.get('details').delete(node.id);
    }
    this.touch();
  }

  d3el: any;
  panel: any;
  tree: any;
}
