import * as outputBase from '@jupyter-widgets/output';

import {
  JupyterPhosphorPanelWidget, OutputModel
} from '@jupyter-widgets/jupyterlab-manager/lib/output';

import {
  Panel
} from '@phosphor/widgets';

import {
  SimplifiedOutputArea
} from '@jupyterlab/outputarea';

import * as $ from 'jquery';


export
class SimplifiedOutputView extends outputBase.OutputView {

    _createElement(tagName: string) {
      this.pWidget = new JupyterPhosphorPanelWidget({ view: this });
      return this.pWidget.node;
    }

    _setElement(el: HTMLElement) {
        if (this.el || el !== this.pWidget.node) {
            // Boxes don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }

        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
     }

  /**
   * Called when view is rendered.
   */
  render() {
    super.render();
    this._outputView = new SimplifiedOutputArea({
      rendermime: this.model.widget_manager.rendermime,
      contentFactory: SimplifiedOutputArea.defaultContentFactory,
      model: this.model.outputs
    });
    // TODO: why is this a readonly property now?
    // this._outputView.model = this.model.outputs;
    // TODO: why is this on the model now?
    // this._outputView.trusted = true;
    this.pWidget.insertWidget(0, this._outputView);

    this.pWidget.addClass('jupyter-widgets');
    this.pWidget.addClass('widget-output');
    this.update(); // Set defaults.
  }

  remove() {
    this._outputView.dispose();
    return super.remove();
  }

  model: OutputModel;
  _outputView: SimplifiedOutputArea;
  pWidget: Panel
}
