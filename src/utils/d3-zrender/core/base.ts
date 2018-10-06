declare var zrender: any;
export interface baseOption {
  w?: number; // canvas画布宽度
  h?: number; // canvas画布高度
  cW?: number; // canvas画布容器宽度
  cH?: number; // canvas画布容器高度
  backgroundColor?: string; // canvas父元素背景颜色
  margin?: any; // canvas画布容器边距
}
export default class Base {
  // 配置
  _opt: baseOption;
  _zr: any;
  _container: any;
  _xScales: any;
  _yScales: any;
  _actives: any;
  handleSelection: any;
  constructor(elm: string | HTMLElement, opt: baseOption = {}) {
    elm = typeof elm === 'string' ? document.getElementById(elm) : elm;
    this._opt = { ...opt, margin: { top: 50, right: 50, bottom: 50, left: 50 }, backgroundColor: '#fff' };
    this._zr = zrender.init(elm);
    // 添加画布
    // 所有的坐标轴、坐标指示器、以及图元都绘制于container中
    this._container = new zrender.Group();
    this._container.attr('position', [this._opt.margin.left + 0.5, this._opt.margin.top + 0.5])
    this._container.attr('name', 'container');
    this._zr.add(this._container);
    // 添加比例尺
    this._xScales = {};
    this._yScales = {}
    this.resize();
    this._actives = []
  }
  resize() {
    this._zr.resize();
    [this._opt.w, this._opt.h] = [this._zr.getWidth(), this._zr.getHeight()];
    [this._opt.cW, this._opt.cH] = [this._opt.w - this._opt.margin.left - this._opt.margin.right,
    this._opt.h - this._opt.margin.top - this._opt.margin.bottom];
  }
}