import { JupyterLab } from '@jupyterlab/application';
import { OutputView } from '@jupyter-widgets/jupyterlab-manager/lib/output';
import { SidePanelModel } from './SidePanelModel';
export declare class SidePanel extends OutputView {
    app: JupyterLab;
    model: SidePanelModel;
    constructor(options: any);
    render(): void;
}
