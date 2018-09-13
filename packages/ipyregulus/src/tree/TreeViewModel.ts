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
      hightlight: null,
      selected: new Set(),
      details: []
    };
  }

  static serializers = {
    ...RegulusViewModel.serializers,
      tree_model: {deserialize: unpack_models},
      selected: {
        serialize:   function(s:any)     { return Array.from(s); },
        deserialize: function(array:any) { return new Set(array); }
      }
  }

  static model_name = "TreeViewModel";
  static view_name = "TreeView";
}
