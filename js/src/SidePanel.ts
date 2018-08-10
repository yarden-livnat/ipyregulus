import {
  JupyterLab
} from '@jupyterlab/application';

import {
    UUID
} from '@phosphor/coreutils';

// import {
//   Widget
// } from '@phosphor/widgets';

// TODO: import from @jupyter-widgets/jupyterlab-manager once Output is
// exported by the main module.
// import {
//    OutputView
// } from '@jupyter-widgets/jupyterlab-manager/lib/output'

import {
  SimplifiedOutputView
} from './SimplifiedOutput';

import {
  SidePanelModel
} from './SidePanelModel';

import './SidePanel.css';

export
class SidePanel extends SimplifiedOutputView {
  app: JupyterLab;
  model: SidePanelModel;

  constructor(options) {
    super(options);
    this.app = options.app;
  }

  render() {
    if (!this.model.rendered) {
      super.render();
      let w = this._outputView;
      w.addClass('rg_sidepanel');
      w.addClass('jp-LinkedOutputView');
      w.title.label = this.model.get('title');
      w.title.closable = true;
      w.id = UUID.uuid4();
      // if (Object.keys(this.model.views).length > 1) {
      //   w.node.style.display = 'none';
      //   let key = Object.keys(this.model.views)[0];
      //   this.model.views[key].then((v: OutputView) => {
      //     v._outputView.activate();
      //   });
      // } else {
        let { shell } = this.app;
        console.log('mode:', this.model.get('side'))
        shell.addToMainArea(w, {mode : this.model.get('side')});
        // shell.activateById(w.id);
      // }
    }
  }
}
