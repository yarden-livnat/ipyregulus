import {
    DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import {
   Message
} from '@phosphor/messaging';

import {
  RegulusViewModel
} from "../RegulusWidget";

import * as d3 from 'd3';

import Panel from './panel';

import './graph.css';
import template from './graph.html';


export
class GraphModel extends RegulusViewModel {
  defaults() {
    return  {
      ...super.defaults(),
      _model_name: 'GraphModel',
      _view_name: 'GraphView',

      axes: [],
      graph: [],
      show: [],
      color: '',
      inverse: new Map(),
      highlight: -1,
      selected: [],

      _add_inverse: null
    };
  }

  initialize(attributes: any, options: { model_id: string; comm?: any; widget_manager: any }): void {
    super.initialize(attributes, options);
    this.listenTo(this, "change:_add_inverse", this.add_inverse);
  }

  add_inverse() {
    let msg = this.get('_add_inverse');
    if (msg) {
      switch (msg.topic) {
        case 'add':
          let current = this.get('inverse');
          for (let [key, value] of Object.entries(msg.data)) {
            current.set(parseInt(key), value);
          }
          this.trigger('change:inverse');
          break;
        case 'reset':
          this.set('inverse', new Map());
          break;
      }
    }
  }

  static serializers = {
    ...RegulusViewModel.serializers,
    axes: {deserialize: unpack_models}
  };
}

export
class GraphView extends DOMWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    // this.listenTo(this.model, 'change', this.model_changed);
  }

  render() {
     d3.select(this.el)
      .classed('rg_graph', true)
      .html(template);

     this.panel = Panel(this, this.el);
  }

  processPhosphorMessage(msg:Message) {
    // console.log('msg:', msg);
    switch (msg.type) {
      case 'after-attach':
        d3.select(this.el.parentNode).classed('rg_graph', true);
        this.panel.resize();
        break;
      case 'resize':
        if (this.panel)
          this.panel.resize();
        break;
    }
  }

  panel: Panel;
}