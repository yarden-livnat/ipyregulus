
import { WidgetModel} from '@jupyter-widgets/base';

import { EXTENSION_SPEC_VERSION } from '../version';

export
class RegulusModel extends WidgetModel {
  defaults() {
    return {...super.defaults(), ...{
      _model_module: RegulusModel.model_module,
      _model_moduel_version: RegulusModel.model_module_version,
    }}
  }

  static serializers = {
    ...WidgetModel.serializers,
  }

  static model_module = '@regulus/ipyregulus';
  static model_module_version = EXTENSION_SPEC_VERSION;
}
