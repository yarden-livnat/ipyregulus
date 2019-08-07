import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


import {
  IJupyterWidgetRegistry, ExportMap
 } from "@jupyter-widgets/base";

import * as ipyregulus from './index';

 import {
   EXTENSION_SPEC_VERSION
 } from './version';

const EXTENSION_ID = '@regulus/ipyregulus';


function activate(app: JupyterFrontEnd, registry: IJupyterWidgetRegistry): void {
  console.log('export map', ipyregulus);
  registry.registerWidget({
    name: EXTENSION_ID,
    version: EXTENSION_SPEC_VERSION,
    exports: ipyregulus as any as ExportMap
  });
}

const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activate,
  autoStart: true
};

export default  extension;

