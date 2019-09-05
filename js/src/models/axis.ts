import { RegulusModel } from "./base";

export
class AxisModel extends RegulusModel {
   defaults() {
     return {
       ...super.defaults(),
       _model_name: 'AxisModel',

       label: '',
       max: 0,
       theta: null,
       len: null,
       disabled: false
     }
   }
}