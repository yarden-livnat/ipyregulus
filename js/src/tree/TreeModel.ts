import {
  BaseModel
} from "../BaseModel";

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
class TreeModel extends BaseModel {

  defaults() {
    return {
      ...super.defaults(),
      _view_name: TreeModel.view_name,

      title: "",
      field: null,
      tree: new Node(null, null),
    };
  }

  static serializers = {
    ...BaseModel.serializers,
    tree: {deserialize: unpack_tree}
  };

  static model_name = "TreeModel";
  static view_name = "Tree";
}
