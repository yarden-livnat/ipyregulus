import {
    unpack_models
} from '@jupyter-widgets/base';

import {
  RegulusViewModel
} from "../RegulusWidget";


export
class TreeViewModel extends RegulusViewModel {

  defaults() {
    return {
      ...super.defaults(),
      _model_name:TreeViewModel.model_name,
      _view_name: TreeViewModel.view_name,

      title: "",
      field: null,
      attrs: {},
      show: null,
      selected: new Set(),
      details: []
    };
  }

  static serializers = {
    ...RegulusViewModel.serializers,
      tree_model: {deserialize: unpack_models},
      // details: {serialize: function(s:any) { return Array.from(s); }, deserialize: function(array:any) { return new Set(array); }},
      selected: {
      serialize: function(s:any) { console.log('serialize selected', s, Array.from(s)); return Array.from(s); },
      deserialize: function(array:any) { console.log('de-serialize selected', array); return new Set(array); }}
  }

  static model_name = "TreeViewModel";
  static view_name = "TreeView";
}
