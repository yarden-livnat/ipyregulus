import { unpack_models } from '@jupyter-widgets/base';
import { RegulusModel } from './base';


export
class RegulusData extends RegulusModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: RegulusData.model_name,
      pts: [],
      values: [],
      partitions: {}
    }
  }

  static serializers = {
    ...RegulusModel.serializers,
    pts: {deserialize: unpack_models},
    values: {deserialize: unpack_models}
  }

  static model_name = 'RegulusData';
}
