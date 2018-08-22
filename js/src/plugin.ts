import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IJupyterWidgetRegistry
} from '@jupyter-widgets/base';

import { Tree } from './models/tree';

import {
  TreeViewModel
} from './tree/TreeViewModel';

import {
  TreeView
} from "./tree/treeview";


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
  registry.registerWidget({
    name: '@regulus/ipyregulus',
    version: EXTENSION_SPEC_VERSION,
    exports: {
      TreeModel: Tree,
      TreeViewModel: TreeViewModel,
      TreeView: TreeView
    }
  });
}
