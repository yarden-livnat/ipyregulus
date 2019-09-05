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
class ProjectionModel extends RegulusViewModel {
  defaults() {
    return  {
      ...super.defaults(),
      _model_name: 'ProjectionModel',
      _view_name: 'ProjectionView',

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
class ProjectionView extends DOMWidgetView {
  initialize(parameters: any): void {
    super.initialize(parameters);
    this.listenTo(this.model, 'change:pts', this.pts_changed);
    this.listenTo(this.model, 'change:axes', this.axes_changed);
    this.listenTo(this.model, 'change:colors', this.colors_changed);
  }

  render() {
     d3.select(this.el)
      .classed('rg_projection', true)
      .html(template);

     this.panel = Panel().el(d3.select(this.el));
     this.axes_changed(this.model, this.model.get('axes'), {});
     this.pts_changed(this.model, this.model.get('pts'), {});
     this.colors_changed(this.model, this.model.get('colors'), {});
  }

  processPhosphorMessage(msg:Message) {
    switch (msg.type) {
      case 'after-attach':
        d3.select(this.el.parentNode).classed('rg_proj', true);
        this.panel.resize();
        break;
      case 'resize':
        if (this.panel)
          this.panel.resize();
        break;
    }
  }

  pts_changed(model, value, options) {
    this.panel.pts(value);
  }

  axes_changed(model, value, options) {
    for (let p of model.previous('axes') || []) {
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