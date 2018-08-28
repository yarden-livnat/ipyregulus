
import ndarray = require('ndarray');

import {
  RegulusData
} from './data';

export
class Partition {

  constructor(data, regulus:RegulusData) {
    this.id = data.id;
    this.persistence = data.persistence;
    this.data = data;
    this.regulus = regulus;
  }

  pts(measure) {
    if (!this.regulus) return null;

    if (!this._pts) {
      this._pts = [];
      let x:ndarray = this.regulus.pts;
      let y = this.regulus.attrs;
      let [from, to] = this.data.pts_span;
      for (let i=from; i<to; i++) {
        let pt:number[] = [];
        let index = this.data.pts_idx[i];
        for (let d=0; d<x.shape[1]; d++)
          pt.push(x.get(index, d));
        pt.push(y.get(index, measure));
        this._pts.push(pt);
      }
    }
    return this._pts;
  }

  reset() {
    this._pts = null;
  }

  _pts:number[][] | null = null;

  id: number;
  persistence: number;
  regulus: RegulusData;
  data: any;
}
