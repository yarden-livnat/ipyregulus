import {
  data_union_array_serialization
} from 'jupyter-dataserializers';

import {
  RegulusModel
} from './base';

import {
  Partition
} from './partition';


function partition_from_json(array: any[],  _: any) {
  let partitions = new Map()
  for (let item of array) {
    partitions.set(item.id, new Partition(item));
  }
  return partitions;
}

export
class RegulusData extends RegulusModel {
  initialize(attributes, options: {model_id: string, comm?: any, widget_manager: any}) {
    super.initialize(attributes, options);
    this.on('change:partitions', this.partitions_changed, this);
  }

  defaults() {
    return {
      ...super.defaults(),
      _model_name: RegulusData.model_name,
      pts_idx: [],
      values_idx: [],
    }
  }

  partitions_changed(_, partitions) {
    for (let p of partitions.values()) {
      p.regulus = this;
    }
  }

  static serializers = {
    ...RegulusModel.serializers,
    pts: data_union_array_serialization,
    values: data_union_array_serialization,
    partitions: {deserialize: partition_from_json}
  }

  static model_name = 'RegulusData';
}
