import {
  DOMWidgetModel
} from "@jupyter-widgets/base";

import {
  EXTENSION_SPEC_VERSION
} from './version';

const MODULE_NAME = '@regulus/ipyregulus';


export
class BaseModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_module: BaseModel.model_module,
      _model_module_version: BaseModel.model_module_version,
      _view_module: BaseModel.view_module,
      _view_module_version: BaseModel.view_module_version,
    };
  }

  static model_module = MODULE_NAME;
  static model_module_version = EXTENSION_SPEC_VERSION;
  static view_module = MODULE_NAME;
  static view_module_version = EXTENSION_SPEC_VERSION;
}
