/// <reference types="ndarray" />


import { unpack_models } from '@jupyter-widgets/base';

import {
  array_serialization, data_union_array_serialization
} from 'jupyter-dataserializers';

import { RegulusModel } from './base';


function test(obj: any,  _: any) {
  console.log('test: ', obj);
}
export
class RegulusData extends RegulusModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: RegulusData.model_name,
      pts_idx: [],
      values_idx: [],
      partitions: {}
    }
  }

  static serializers = {
    ...RegulusModel.serializers,
    pts: data_union_array_serialization,
    values: data_union_array_serialization
  }

  static model_name = 'RegulusData';
}
