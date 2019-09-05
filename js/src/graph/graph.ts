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
      color: '',
      graph: {}

    };
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
    this.listenTo(this.model, 'change', this.model_changed);
  }

  render() {
     d3.select(this.el)
      .classed('rg_graph', true)
      .html(template);

     this.panel = Panel().el(d3.select(this.el));
     this.axes_changed();
     this.panel.color(this.model.get('color'));
     //this.panel.redraw();
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

  model_changed() {
    console.log('model changed:', this.model.changedAttributes());
    for (let [name, value] of Object.entries(this.model.changedAttributes())) {
      switch (name) {
        case 'axes':
          this.axes_changed();
          break;
        case 'color':
          this.panel.color(this.model.get('color'));
          break;
        case 'graph':
          let g = this.model.get('graph');
          let map = new Map();
          for (let p of g.pts) {
            map.set(p.id, p)
          }
          let nodes:[any] = g.nodes;
          for (let node of nodes) {
            node.min = map.get(node.min_idx);
            node.max = map.get(node.max_idx);
          }
          this.panel.graph(g);
          break;
        default:
          break;
      }
    }
    this.panel.redraw();
  }

  axes_changed() {
    console.log('axes changed');
    for (let p of this.model.previous('axes') || []) {
      this.stopListening(p);
    }
    let axes = this.model.get('axes');
    for (let a of axes) {
      this.listenTo(a, 'change', this.update_axes);
    }
    console.log('axes = ', axes);
    this.panel.axes(axes).redraw();
  }

  update_axes(model, value, options) {
    this.panel.update_axis(model);
  }

  panel: Panel;
}