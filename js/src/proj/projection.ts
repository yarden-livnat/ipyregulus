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

      data: null,
      axes: [],
      show: [],
      show_graph: true,
      show_pts: true,
      highlight: -2,
      color: '',
      color_info: []
    };
  }

  static serializers = {
    ...RegulusViewModel.serializers,
    axes: {deserialize: unpack_models},
    data: {deserialize: unpack_models},
  };
}

export
class ProjView extends DOMWidgetView {
  render() {
    d3.select(this.el)
      .classed('rg_projection', true)
      .html(template);

    this.panel = Panel(this, this.el);
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

  panel: Panel;
}