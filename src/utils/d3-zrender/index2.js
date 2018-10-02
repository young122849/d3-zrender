import zrender from 'zrender';
import * as d3 from 'd3';
import { AxisBuilder } from './AxisBuilder';
import { BrushXBuilder } from './BrushBuilder';
import { fixCoordinate } from './helper/fix'
export default class Chart {
  constructor(elm, opt) {
    opt = { ...opt, margin: { top: 100, right: 100, bottom: 50, left: 100 } };
    elm = typeof elm === 'string' ? document.querySelector(elm) : elm;
    this._zr = zrender.init(elm);
    this._scales = {};
    this._scales.vScales = [];
    this._scales.hScale = d3.scalePoint().domain(d3.range(8));
    this._scales.color = d3.scaleSequential(d3.interpolateRdYlBu);
    this._custom = document.createElement('custom');
    this._opt = opt;

    this._groupIds = [];
    this._actives = [];
    this._container = new zrender.Group();
    this._container.position = [this._opt.margin.left, this._opt.margin.top];
    this._zr.add(this._container);
    this._axisGroup = new zrender.Group();
    this._brushGroup = new zrender.Group();
    this._graphGroup = new zrender.Group();
    this._container.add(this._graphGroup);
    // this._container.add(this._axisGroup);
    // this._container.add(this._brushGroup);
    this.keys = null;

  }
  updateData (data) {

    this.data = data || this.data;
    this.resize();
    this.init();

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
  init () {
    let keys = Object.keys(this.data[0]).filter(i => i !== 'city');
    let self = this;
    this._scales.hScale.domain(keys).range([0, this._opt.cWidth]);
    let ticks = this._scales.hScale.domain().map(i => ({ pos: parseInt(this._scales.hScale(i)) + 0.5, value: i }));
    for (let tick of ticks) {
      let g = new zrender.Group();
      g.position = [tick.pos, 0];
      g.name = tick.value;
      g.on('drag', function (ev) {
        let offsetX = fixCoordinate(ev, self._opt);
        this.position = [parseInt(offsetX) + 0.5, 0.5];
        self._container.remove(g);
        self._container.add(g);
        self._zr.refresh();
      });
      g.on('dragend', function (ev) {
        let offsetX = fixCoordinate(ev, self._opt);
        let newTick = { pos: parseInt(offsetX), value: this.name };
        self.reorder(newTick);
      })
      this._container.add(g);
      this.mountAxis(tick.value);
      this.mountBrush(tick.value);
    }
  }
  reorder (newTick) {
    // 简单插入排序
    let ticks = this._scales.hScale.domain().map(i => ({ pos: parseInt(this._scales.hScale(i)), value: i }))
    let index = ticks.findIndex(i => i.value === newTick.value);
    ticks[index].pos = newTick.pos;
    ticks = ticks.sort(function (a, b) {
      return a.pos - b.pos;
    });
    this._scales.hScale.domain(ticks.map(i => i.value)).range([0, this._opt.cWidth]);
    this._scales.hScale.domain().forEach(i => {
      let g = this._container.childOfName(i);
      this._container.remove(g);
      g.position = [parseInt(this._scales.hScale(i)) + 0.5, 0];
      this._container.add(g);
      this._zr.refresh();
    });
    this.render();
  }
  updateAxis () {
    // if (this._scales.hScale.domain().length === 0) {
    //   this._scales.hScale.domain(Object.keys(this.data[0])).range([0, this._opt.cWidth]);
    // }
    // this._scales.hScale.domain().forEach(i => {
    //   let g = new zrender.Group();
    //   g.position =
    //   this._groupIds.push(g.id);
    //   this._container.add(g);
    // })
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
    for (let d of filter) {
      let coordinates = [];
      for (let key of this._scales.hScale.domain()) {
        coordinates.push([this._scales.hScale(key), this._scales.vScales[key].scale(d[key])]);
      }
      coordinates.fill = this._scales.color(d['PM10'])

      this.computed.push(coordinates);
    }
  }
  mountAxis (name) {
    // this._axisGroup.removeAll();
    // this._zr.refresh();
    let parentGroup = this._container.childOfName(name);
    if (parentGroup == null)
      return;
    if (name === 'rating') {
      let domain = [...new Set(this.data.map(i => i[name]))];
      let range = [this._opt.cHeight, 0];
      this._scales.vScales[name] = { scale: d3.scalePoint().domain(domain).range(range) }
    } else {
      let domain = [0, d3.max(this.data, i => +i[name])];
      let range = [this._opt.cHeight, 0];
      this._scales.vScales[name] = { scale: d3.scaleLinear().domain(domain).range(range) };
    }
    let childGroup = AxisBuilder(this._scales.vScales[name].scale, { ...this._opt, name: name, orient: 'right', tickArguments: 5 }, this);
    parentGroup.add(childGroup);
  }
  mountBrush (name) {
    // this._brushGroup.removeAll();
    // this._zr.refresh();
    let parentGroup = this._container.childOfName(name);
    if (parentGroup == null) return;
    let g = BrushXBuilder(this, { ...this._opt, key: name, extent: [20, this._opt.cHeight] });
    parentGroup.add(g);

  }

}