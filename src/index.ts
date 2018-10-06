import Base from './utils/d3-zrender/core/base';
let base = new Base('canvas');
declare var d3: any;
declare var zrender: any;
import { AxisBuilder } from './utils/d3-zrender/core/AxisBuilder';
import { BrushY } from './utils/d3-zrender/core/BrushBuilder';
import { LiquidfillBuilder } from './utils/d3-zrender/core/LiquidfillBuilder';
import { vLinePointer, hLinePointer } from './utils/d3-zrender/core/PointerBuilder';
let zr: Base = new Base('canvas');

let g = new zrender.Group({ name: 'vertical' });
zr._container.add(g);
// console.log(g);
let scale = d3.scaleLinear().domain([0, 100]).range([zr._opt.cH, 0]);
// let scale = d3.scaleBand().domain(['A', 'B', 'C']).range([zr._opt.cH, 0]);
// vLinePointer(scale, { trigger: 'axis', name: 'test', continuous: false, ...zr._opt }, g, zr);
hLinePointer(scale, { trigger: 'axis', continuous: true, name: 'test', ...zr._opt }, g, zr);