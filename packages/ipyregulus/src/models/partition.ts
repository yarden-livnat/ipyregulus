
import ndarray = require('ndarray');

import {
  RegulusData
} from './data';

export
class Partition {

  constructor(data, loc) {
    this.id = data.id;
    this.persistence = data.persistence;
    this.loc = loc
    this.data = data;
  }

  // _get_pt(i, x, y, measure) {
  //   let pt:number[] = [];
  //   let index = this.data.pts_idx[i];
  //   for (let d=0; d<x.shape[1]; d++)
  //     pt.push(x.get(index, d));
  //   pt.push(y.get(index, measure));
  //   return pt;
  // }
  //
  // pts(measure) {
  //   if (!this.regulus) return null;
  //
  //   if (!this._pts) {
  //     this._pts = [];
  //     let x:ndarray = this.regulus.pts;
  //     let y = this.regulus.attrs;
  //     let [from, to] = this.data.pts_span;
  //     for (let i=from; i<to; i++) {
  //       this._pts.push(this._get_pt(i, x, y, measure));
  //     }
  //     this._pts.push(this._get_pt(this.data.minmax_idx[0], x, y, measure))
  //     this._pts.push(this._get_pt(this.data.minmax_idx[1], x, y, measure))
  //   }
  //   return this._pts;
  // }

  index() {
      let [from, to] = this.data.pts_span;
      let idx:number[] = [];
      for (let i=from; i<to; i++) idx.push(this.loc[i]);
      idx.push(this.data.minmax_idx[0]);
      idx.push(this.data.minmax_idx[1]);
      return idx;
  }

  reset() {
    this._pts = null;
  }

  _pts:number[][] | null = null;

  id: number;
  persistence: number;
  loc: number[];
  data: any;
}
