import {
  data_union_array_serialization
} from 'jupyter-dataserializers';

import {
  RegulusModel
} from './base';

import ndarray = require('ndarray');

export
class RegulusData extends RegulusModel {

  defaults() {
    return {
      ...super.defaults(),
      _model_name: RegulusData.model_name,
      pts_idx: [],
      values_idx: [],
      partitions: [],
      pts: ndarray([]),
      attrs: ndarray([])
    }
  }

  pts_idx: string[];
  values_idx: string[];
  pts: ndarray;
  attrs: ndarray;
  partitions: [];

  static serializers = {
    ...RegulusModel.serializers,
    pts: data_union_array_serialization,
    attrs: data_union_array_serialization,
  }

  static model_name = 'RegulusData';
}
