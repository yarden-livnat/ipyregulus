
import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IJupyterWidgetRegistry, ExportMap
 } from "@jupyter-widgets/base";

import * as ipyregulus from './index';

 import {
   EXTENSION_SPEC_VERSION
 } from './version';

const EXTENSION_ID = '@regulus/ipyregulus';


const regulusPlugin: JupyterLabPlugin<void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateRegulusExtension,
  autoStart: true
};

export default  regulusPlugin;

function activateRegulusExtension(app: JupyterLab, registry: IJupyterWidgetRegistry): void {
  console.log('export map', ipyregulus)
  registry.registerWidget({
    name: EXTENSION_ID,
    version: EXTENSION_SPEC_VERSION,
    exports: ipyregulus as any as ExportMap
  });
}
