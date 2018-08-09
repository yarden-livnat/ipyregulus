import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IJupyterWidgetRegistry
} from '@jupyter-widgets/base';

import {
  TreeModel
} from './tree/TreeModel';

import {
  Tree
} from "./tree/tree";

import {
  SidePanelModel
} from "./SidePanelModel"
import {
  SidePanel
} from "./SidePanel";

import {
  EXTENSION_SPEC_VERSION
} from './version';

const EXTENSION_ID = '@regulus/ipyregulus-extension';


const regulusPlugin: JupyterLabPlugin<void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateRegulusExtension,
  autoStart: true
};

export default  regulusPlugin;

function activateRegulusExtension(app: JupyterLab, registry: IJupyterWidgetRegistry): void {
  console.log('Activate RegulusExtension');

  let AppSidePanel = class extends SidePanel {
    constructor(options) {
      super({app, ...options});
    }
  }

  registry.registerWidget({
    name: '@regulus/ipyregulus',
    version: EXTENSION_SPEC_VERSION,
    exports: {
      TreeModel: TreeModel,
      Tree: Tree,
      SidePanelModel: SidePanelModel,
      SidePanel: AppSidePanel
    }
  });
}
