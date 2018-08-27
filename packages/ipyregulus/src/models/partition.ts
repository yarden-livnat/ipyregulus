
import ndarray = require('ndarray');

import {
  RegulusData
} from './data';


export
class Partition {

  constructor(dict, regulus?:RegulusData) {
    this.id = dict.id;
    this.persistence = dict.persistence;
    this.pts_span = dict.pts_span;
    this.minmax_idx = dict.minmax_idx;
    this.max_merge = dict.max_merge;
    this.x = ndarray([]);
    this.y = ndarray([]);
    this.regulus = regulus;
  }

  id: number;
  persistence: number;
  pts_span: [];
  minmax_idx: [];
  max_merge: boolean;
  x: ndarray;
  y: ndarray;
  regulus: any;
}
