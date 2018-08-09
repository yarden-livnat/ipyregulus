import { DOMWidgetModel, DOMWidgetView } from "@jupyter-widgets/base";
export declare class TestModel extends DOMWidgetModel {
    defaults(): any;
    static serializers: {
        [x: string]: {
            deserialize?: (value?: any, manager?: import("@jupyter-widgets/base/lib/manager-base").ManagerBase<any>) => any;
            serialize?: (value?: any, widget?: import("@jupyter-widgets/base/lib/widget").WidgetModel) => any;
        };
    };
    static model_name: string;
    static model_module: string;
    static model_module_version: string;
    static view_name: string;
    static view_module: string;
    static view_module_version: string;
}
export declare class TestView extends DOMWidgetView {
    callback(event: any, el: any): void;
    render(): void;
    draw(): void;
    private input;
    private title;
}
