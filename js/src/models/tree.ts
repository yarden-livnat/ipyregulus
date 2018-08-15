import { ManagerBase } from '@jupyter-widgets/base';

import { RegulusModel } from './base';


export
class Tree extends RegulusModel {
  defaults() {
    return {...super.defaults(), ...{
      _model_name: 'TreeModel',
      root: null,
      attrs: null,
    }}
  }

  static serializers  = {
    ...RegulusModel.serializers,
    root: { deserialize: unpack_tree},
  }
}




class Node {
  constructor(parent:Node = null, data:any) {
    this.parent = parent;
    this.children = [];
    Object.assign(this, data)
  }

  parent: Node;
  children: Node[];
}


function unpack_tree(array: any,  _: ManagerBase<any>) {
  let i = 0;
  return array && unpack(null) || null;

  function unpack(parent) {
    let node = new Node(parent, array[i]);
    while (array[++i]) {
      node.children.push(unpack(node));
    }
    return node;
  }
}
