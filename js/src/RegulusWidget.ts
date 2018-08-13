import {
  DOMWidgetModel
} from "@jupyter-widgets/base";

import {
  EXTENSION_SPEC_VERSION
} from './version';

const MODULE_NAME = '@regulus/ipyregulus';


export
class RegulusViewModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_module: RegulusViewModel.model_module,
      _model_module_version: RegulusViewModel.model_module_version,
      _view_module: RegulusViewModel.view_module,
      _view_module_version: RegulusViewModel.view_module_version,
    };
  }

  static model_module = MODULE_NAME;
  static model_module_version = EXTENSION_SPEC_VERSION;
  static view_module = MODULE_NAME;
  static view_module_version = EXTENSION_SPEC_VERSION;
}
