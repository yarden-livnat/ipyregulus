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
      pts_loc: [],
      pts: ndarray([]),
      pts_idx: [],
      pts_extent: [],
      attrs: ndarray([]),
      attrs_idx: [],
      attrs_extent: [],
      partitions: [],
      measure: ''
    }
  }

  pts_loc: number[];
  pts: ndarray;
  pts_idx: string[];
  pts_extent: number[];
  attrs: ndarray;
  attrs_idx: string[];
  attrs_extent: number[];
  partitions: any[];
  measure:string;

  static serializers = {
    ...RegulusModel.serializers,
    pts: data_union_array_serialization,
    attrs: data_union_array_serialization,
  };

  static model_name = 'RegulusData';
}
