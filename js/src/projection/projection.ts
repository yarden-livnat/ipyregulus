import {
    DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import {
   Message
} from '@phosphor/messaging';

import {
  RegulusViewModel
} from "../RegulusWidget";

import {
  Partition
} from '../models/partition';

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

      title: '',
      data: null,
      measure: null,
      show: [],
    };
  }

  static serializers = {
    ...RegulusViewModel.serializers,
    data: {deserialize: unpack_models},
    tree_model: {deserialize: unpack_models},
  };
}

export
class ProjectionView extends DOMWidgetView {
  initialize(parameters: any): void {
    super.initialize((parameters);
    this.model.on('change:title', this.on_title_changed, this);
  }

  render() {
    this.d3el = d3.select(this.el)
      .classed('rg_details', true);

    this.d3el.html(template);
    this.panel = Panel(this).el(d3.select(this.el));

    setTimeout( () => {
      // this.panel.resize();
      this.title_changed();
      this.panel.model(this.model);
    }, 0);
  }

  processPhosphorMessage(msg:Message) {
    // console.log('Tree phosphor message', msg);
    switch (msg.type) {
      case 'after-attach':
        d3.select(this.el.parentNode).classed('rg_projection', true);
        break;
      case 'resize':
        this.panel.resize();
        break;
    }
  }

  title_changed() {
    this.d3el.select('.title').text(this.model.get('title'));
  }

  d3el: any;
  panel: any;
  partitions: Map<number, Partition> = new Map();
}