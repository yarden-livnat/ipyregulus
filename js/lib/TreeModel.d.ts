import { DOMWidgetModel } from "@jupyter-widgets/base";
declare class Node {
    constructor(parent: Node, data: Object);
    data: Object;
    parent: Node;
    children: Node[];
}
declare function unpack_tree(array: any): Node;
export declare class TreeModel extends DOMWidgetModel {
    defaults(): any;
    static serializers: {
        root: {
            deserialize: typeof unpack_tree;
        };
    };
    static model_name: string;
    static model_module: string;
    static model_module_version: string;
    static view_name: string;
    static view_module: string;
    static view_module_version: string;
}
export {};
