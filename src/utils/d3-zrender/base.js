import zrender from 'zrender';

export default class Chart {
  constructor(elm, opt) {
    let defaultOpt = {
      margin: { top: 50, right: 70, bottom: 50, left: 70 },
      backgroundColor: '#fff'
    };
    elm = typeof elm === 'string' ? document.querySelector(elm) : elm;
    this._opt = { ...defaultOpt, ...opt };
    this._zr = zrender.init(elm);
    // 添加画布
    this._container = new zrender.Group();
    this._container.position = [this._opt.margin.left, this._opt.margin.top];
    this._zr.add(this._container);


    // 添加比例尺
    this._scales = {};
    this._scales.x = {};
    this._scales.y = {};
    // this._scales.p = {};
    this._custom = document.createElement('custom');
    this.resize();
    // 添加指示器

  }
  resize () {
    this._zr.resize();
    this._opt.w = this._zr.getWidth();
    this._opt.h = this._zr.getHeight();
    this._opt.cW = this._opt.w - this._opt.margin.left - this._opt.margin.right;
    this._opt.cH = this._opt.h - this._opt.margin.top - this._opt.margin.bottom;
  }
}