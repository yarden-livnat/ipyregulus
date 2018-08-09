import { OutputModel } from '@jupyter-widgets/jupyterlab-manager/lib/output';
export declare class SidePanelModel extends OutputModel {
    rendered: boolean;
    defaults(): any;
    initialize(attributes: any, options: any): void;
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
