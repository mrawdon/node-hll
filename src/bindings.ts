// bindings.ts
// Declare the interface of your addon:
export interface IHllBinding {
    new (arg1: Buffer | number):IHllBinding;
    toBuffer: () => Buffer;
    add(arg: Buffer | string):void;
    count(): number;
    merge(arg: IHllBinding):void;
}
// Load it with require
var HllBinding: IHllBinding = require('../../build/Release/node-hll.node').HLL;
export default HllBinding;