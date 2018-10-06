import zrender from 'zrender';
import * as d3 from 'd3';
import Chart from './base';
import { AxisBuilder } from './AxisBuilder';
import { BrushXBuilder } from './BrushBuilder';

export default class ParallelCoordinate extends Chart {
  constructor(elm, opt) {
    super(elm, opt);
  }
  updateData (data) {
    this._data = data || this._data;
    this.init();
    this.updateScale()
    this.compute();
    this.render();
  }
  init () {
    this._actives = [];
    this._graphGroup = new zrender.Group();
    this._graphGroup.attr('name', 'graphs');
    this._container.add(this._graphGroup);
    this._columns = ["date", "AQI", "PM2.5", "PM10", "CO", "NO2", "SO2", "rating"];
    let self = this;
    this._scales.x['category'] = d3.scalePoint().domain(this._columns).range([0, this._opt.cW]);
    this._scales.x['category'].domain().forEach(c => {
      let g = new zrender.Group();
      g.attr('name', c);
      g.attr('position', [parseInt(this._scales.x['category'](c)) + 0.5, 0]);
      self._container.add(g);
      if (c === 'rating') {
        self._scales.y[c] = d3.scalePoint();
      } else {
        self._scales.y[c] = d3.scaleLinear();
      }
    });
    this._scales.color = d3.scaleSequential(d3.interpolateRdYlBu)
  }
  updateScale (reorder) {
    this._scales.x['category'].domain(this._columns).range([0, this._opt.cW]);
    this._scales.color.domain([0, d3.max(this._data, i => i['PM10'])]);
    this._columns.forEach(c => {
      let g = this._container.childOfName(c);
      g.attr('position', [parseInt(this._scales.x['category'](c)) + 0.5, 0]);
      if (reorder !== true) {
        // 如果仅仅是重排序坐标轴，则不需要更新坐标轴
        let parentGroup = this._container.childOfName(c);
        if (c === 'rating') {
          this._scales.y[c].domain([...new Set(this._data.map(i => i.rating))]).range([this._opt.cH, 0]);
          AxisBuilder(this._scales.y[c], { ...this._opt, name: c, position: 'top', stroke: '#000', orient: 'left' }, parentGroup, this)
        } else {
          this._scales.y[c].domain([0, d3.max(this._data, i => i[c])]).range([this._opt.cH, 0]).nice();
          AxisBuilder(this._scales.y[c], { ...this._opt, name: c, position: 'top', stroke: '#000', orient: 'left' }, parentGroup, this)
        }
        BrushXBuilder(this, { ...this._opt, key: c, extent: [20, this._opt.cH] }, parentGroup);
      }
    });
  }
  shuffle (columns) {
    this._columns = columns;
    this.updateScale(true);
    this.compute();
    this.render();
  }
  handleSelection () {
    this.compute();
    this.render();
  }
  reorder (newTick) {
    // 简单插入排序
    let ticks = this._scales.x['category'].domain().map(i => ({ pos: parseInt(this._scales.x['category'](i)), value: i }))
    let index = ticks.findIndex(i => i.value === newTick.value);
    ticks[index].pos = newTick.pos;
    ticks = ticks.sort(function (a, b) {
      return a.pos - b.pos;
    });
    let newTicks = ticks.map(i => i.value);
    this.shuffle(newTicks);
  }
  render () {
    // this._graphGroup.removeAll();
    let line = d3.line();
    let custom = d3.select(this._custom);
    let self = this;
    let updates = custom.selectAll('custom.line').data(this._computed);
    let exits = updates.exit();
    let enters = updates.enter().append('custom').attr('class', 'line');
    enters.attr('fill', d => d.fill)
      .attr('d', d => d);
    enters.each(function (d) {
      let node = d3.select(this);
      let line = new zrender.Polyline({
        shape: { points: d },
        style: { stroke: d.fill }
      });
      line.attr('name', "#" + line.id);
      node.attr('id', '#' + line.id);
      self._graphGroup.add(line);
    });
    updates.each(function (d) {
      let node = d3.select(this);
      let line = self._graphGroup.childOfName(node.attr('id'));
      line.animateTo({
        shape: { points: d }
      }, 200);
    });
    exits.each(function (d) {
      let node = d3.select(this);
      let line = self._graphGroup.childOfName(node.attr('id'));
      line.animateTo({
        style: { stroke: 'transparent' }
      }, 200, function () {
        self._graphGroup.remove(line);
      });

    });
    exits.remove();
  }
  compute () {
    // 筛选数据
    let filter = this._data.slice();
    for (let active of this._actives) {
      let scale = this._scales.y[active.key];
      let index = 0;
      for (let i = 0, j = filter.length; i < j; ++i) {
        let pos = scale(filter[i][active.key]);
        if (pos <= active.extent[1] && pos >= active.extent[0]) {
          filter[index++] = filter[i];
        }
      }
      filter.length = index;
    }
    this._computed = [];

    for (let d of filter) {
      let coordinates = [];
      for (let key of this._scales.x['category'].domain()) {
        coordinates.push([this._scales.x['category'](key), this._scales.y[key](d[key])]);
      }
      coordinates.fill = this._scales.color(d['PM10']);
      this._computed.push(coordinates);
    }

  }
}