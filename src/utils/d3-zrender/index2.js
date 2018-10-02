import zrender from 'zrender';
import * as d3 from 'd3';
import { AxisBuilder } from './AxisBuilder';
import { BrushXBuilder } from './BrushBuilder';
export default class Chart {
  constructor(elm, opt) {
    opt = { ...opt, margin: { top: 50, right: 50, bottom: 50, left: 50 } };
    elm = typeof elm === 'string' ? document.querySelector(elm) : elm;
    this._zr = zrender.init(elm);
    this._scales = {};
    this._scales.vScales = [];
    this._scales.hScale = d3.scaleBand();
    this._scales.color = d3.scaleSequential(d3.interpolateRdYlBu);
    this._custom = document.createElement('custom');
    this._opt = opt;

    this._actives = [];
    this._container = new zrender.Group();
    this._container.position = [this._opt.margin.left, this._opt.margin.top];
    this._zr.add(this._container);
    this._axisGroup = new zrender.Group();
    this._brushGroup = new zrender.Group();
    this._graphGroup = new zrender.Group();
    this._container.add(this._graphGroup);
    this._container.add(this._axisGroup);
    this._container.add(this._brushGroup);
    this.keys = null;

  }
  updateData (data) {

    this.data = data || this.data;

    this.resize();
    // this.reorder();
    this.updateAxis();
    this.mountAxis()
    this.mountBrush();
    this.render();
  }
  resize () {
    this._opt.width = this._zr.getWidth();
    this._opt.height = this._zr.getHeight();
    this._opt.cWidth = this._opt.width - this._opt.margin.left - this._opt.margin.right;
    this._opt.cHeight = this._opt.height - this._opt.margin.top - this._opt.margin.bottom;
  }
  reorder (newTick) {
    // 简单插入排序
    let ticks = this._scales.hScale.domain().map(i => ({ pos: this._scales.hScale(i), value: i }))
    let index = ticks.findIndex(i => i.value === newTick.value);
    ticks[index].pos = newTick.pos;
    ticks = ticks.sort(function (a, b) {
      return a.pos - b.pos;
    });
    this._scales.hScale.domain(ticks.map(i => i.value)).range([0, this._opt.cWidth]);
    this.updateData();
  }
  updateAxis () {
    if (this._scales.hScale.domain().length === 0) {
      this._scales.hScale.domain(Object.keys(this.data[0])).range([0, this._opt.cWidth]);
    }
    this._scales.color.domain(d3.extent(this.data, i => i['PM10']))
  }
  render () {
    this.compute();
    let custom = d3.select(this._custom);
    let line = d3.line()
    let updates = custom.selectAll('custom.rect').data(this.computed);
    let enters = updates.enter().append('custom').attr('class', 'rect');
    let exits = updates.exit().remove();
    this._graphGroup.removeAll();
    this._zr.refresh();
    let timer = null;
    let graphs = custom.selectAll('custom.rect').attr('d', d => line(d));
    let self = this;
    timer = d3.timer(function () {
      self._graphGroup.removeAll();
      self._zr.refresh();
      graphs.each(function (d) {
        let pathStr = d3.select(this).attr('d');
        let polyline = zrender.path.createFromString(pathStr, {
          style: { stroke: d.fill, fill: 'transparent' }
        });
        self._graphGroup.add(polyline);
      });

    })


  }
  compute () {
    // 筛选数据
    let filter = this.data.slice();
    for (let active of this._actives) {
      let scale = this._scales.vScales[active.key].scale;
      let index = 0;
      for (let i = 0, j = filter.length; i < j; ++i) {
        let pos = scale(filter[i][active.key]);
        if (pos <= active.extent[1] && pos >= active.extent[0]) {
          filter[index++] = filter[i];
        }
      }
      filter.length = index;
    }
    this.computed = [];
    console.log(this._scales.hScale.domain())
    for (let d of filter) {
      let coordinates = [];
      for (let key of this._scales.hScale.domain()) {
        coordinates.push([this._scales.hScale(key), this._scales.vScales[key].scale(d[key])]);
      }
      coordinates.fill = this._scales.color(d['PM10'])

      this.computed.push(coordinates);
    }
  }
  mountAxis () {
    this._axisGroup.removeAll();
    this._zr.refresh();
    let ticks = this._scales.hScale.domain().map(i => ({ pos: this._scales.hScale(i), value: i }));
    for (let tick of ticks) {
      if (tick.value === 'city' || tick.value === 'rating') {
        let domain = [...new Set(this.data.map(i => i[tick.value]))];
        let range = [this._opt.cHeight, 0];
        this._scales.vScales[tick.value] = { scale: d3.scalePoint().domain(domain).range(range), position: [parseInt(this._scales.hScale(tick.value)) + 0.5, 0] };
      } else {
        let domain = [0, d3.max(this.data, i => +i[tick.value])];
        let range = [this._opt.cHeight, 0];
        this._scales.vScales[tick.value] = { scale: d3.scaleLinear().domain(domain).range(range), position: [parseInt(this._scales.hScale(tick.value)) + 0.5, 0] };
      }
      let temp = this._scales.vScales[tick.value];
      let g = AxisBuilder(temp.scale, { ...this._opt, name: tick.value, orient: 'right', position: temp.position, type: 'line', tickArguments: 5 }, this);
      this._axisGroup.add(g);

    }
  }
  mountBrush () {
    this._brushGroup.removeAll();
    this._zr.refresh();
    let ticks = this._scales.hScale.domain().map(i => ({ pos: this._scales.hScale(i), value: i }));
    for (let tick of ticks) {
      let g = BrushXBuilder(this, { ...this._opt, key: tick.value, extent: [20, this._opt.cHeight], position: [parseInt(this._scales.hScale(tick.value)) + 0.5, 0.5] });
      this._brushGroup.add(g);
    }
  }

}