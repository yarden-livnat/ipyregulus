import {
  DOMWidgetModel
} from "@jupyter-widgets/base";

import {
  EXTENSION_SPEC_VERSION
} from '../version';


const MODULE_NAME = '@regulus/ipyregulus';

class Node {
  constructor(parent:Node, data:Object) {
    this.parent = parent;
    this.children = [];
    for (let key in data) {
      this[key] = data[key];
    }
  }

  data: Object;
  parent: Node;
  children: Node[];
}

function unpack_tree(array):Node {
  let i = 0;
  return unpack(null);

  function unpack(parent:Node) {
    let node = new Node(parent, array[i]);
    while (array[++i]) {
      node.children.push(unpack(node));
    }
    return node;
  }
}

export
class TreeModel extends DOMWidgetModel {

  defaults() {
    return {
      ...super.defaults(),
      _model_module: TreeModel.model_module,
      _model_module_version: TreeModel.model_module_version,
      _view_name: TreeModel.view_name,
      _view_module: TreeModel.view_module,
      _view_module_version: TreeModel.view_module_version,

      title: "",
      field: null,
      root: new Node(null, null),
    };
  }

  static serializers = {
    ...DOMWidgetModel.serializers,
    root: {deserialize: unpack_tree}
  };

  static model_name = "TreeModel";
  static model_module = MODULE_NAME;
  static model_module_version = EXTENSION_SPEC_VERSION;
  static view_name = "Tree";
  static view_module = MODULE_NAME;
  static view_module_version = EXTENSION_SPEC_VERSION;
}
