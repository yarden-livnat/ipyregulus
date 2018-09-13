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

import './details.css';
import * as template from './details.html';

export
class DetailsModel extends RegulusViewModel {
  defaults() {
    return  {
      ...super.defaults(),
      _model_name: DetailsModel.model_name,
      _view_name: DetailsModel.view_name,

      title: '',
      data: null,
      measure: '',
      show: [],
      highlight: -2
    };
  }

  static serializers = {
    ...RegulusViewModel.serializers,
    data: {deserialize: unpack_models},
    tree_model: {deserialize: unpack_models},
  }

  static model_name = 'DetailsModel';
  static view_name = 'DetailsView';
}


export
class DetailsView extends DOMWidgetView {
  render() {
    this.d3el = d3.select(this.el)
      .classed('rg_details', true);

    this.d3el.html(template);
    this.panel = Panel(this).el(d3.select(this.el));

    this.model.on('change:title', this.title_changed, this);

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
        d3.select(this.el.parentNode).classed('rg_output', true);
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
