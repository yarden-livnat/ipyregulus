import { ManagerBase } from '@jupyter-widgets/base';

import { RegulusModel } from './base';


export
class Tree extends RegulusModel {
  defaults() {
    return {...super.defaults(), ...{
      _model_name: 'TreeModel'
    }}
  }

  static serializers  = {
    ...RegulusModel.serializers,
    root: { deserialize: unpack_tree}
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
  if (array == null) {
    return null;
  }

  let i = 0;
  return unpack(null);

  function unpack(parent) {
    let node = new Node(parent, array[i]);
    while (array[++i]) {
      node.children.push(unpack(node));
    }
    return node;
  }
}
