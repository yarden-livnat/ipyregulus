import { RegulusModel } from "./base";

export
class AxisModel extends RegulusModel {
   defaults() {
     return {
       ...super.defaults(),
       _model_name: 'AxisModel',

       label: '',
       col: 0,
       theta: 0,
       len: 100,
       disabled: false
     }
   }
}