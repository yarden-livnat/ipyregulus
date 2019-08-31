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

import './projection.css';
import template from './projection.html';


export
class ProjModel extends RegulusViewModel {
  defaults() {
    return  {
      ...super.defaults(),
      _model_name: 'ProjModel',
      _view_name: 'ProjView',

      pts: [],
      axes: []
    };
  }

  static serializers = {
    ...RegulusViewModel.serializers,
    axes: {deserialize: unpack_models}
  };
}

export
class ProjView extends DOMWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    // this.listenTo(this.model, 'change', this.model_changed);
    this.listenTo(this.model, 'change:pts', this.pts_changed);
    this.listenTo(this.model, 'change:axes', this.axes_changed);
    this.listenTo(this.model, 'change:colors', this.colors_changed);
  }

  render() {
     d3.select(this.el)
      .classed('rg_projection', true)
      .html(template);
  }

  processPhosphorMessage(msg:Message) {
    switch (msg.type) {
      case 'after-attach':
        d3.select(this.el.parentNode).classed('rg_proj', true);
        this.panel = Panel().el(d3.select(this.el));
        break;
      case 'resize':
        this.panel.resize();
        break;
    }
  }

  pts_changed(model, value, options) {
    this.panel.pts(value);
  }

  axes_changed(model, value, options) {
    for (let p of model.previous('axes')) {
      this.stopListening(p);
    }
    for (let a of value) {
      this.listenTo(a, 'change', this.update_axes)
    }
    this.panel.axes(value);
  }

  update_axes(model, value, options) {
    this.panel.update_axis(model);
  }

  colors_changed(model, value, options) {
    this.panel.colors(value);
  }

  panel: Panel;
}