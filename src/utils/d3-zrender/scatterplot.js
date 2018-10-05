import Chart from "./base";
import * as d3 from 'd3';
import { AxisBuilder } from './AxisBuilder';
import { vLinePointer, hLinePointer } from './PointerBuilder'
import zrender from 'zrender'
export default class Scatterplot extends Chart {
  constructor(elm, opt) {
    super(elm, opt);
    this._zr.dom.style.backgroundColor = '#404a59';
    this.init();
  }
  updateData (data) {
    this._data = data || this._data;
    this._scales.color.domain(this._data.counties);
    // this.compute(1800);
    // // year += 20;
    // this.updateScale();
    // this.mountPointer('yPointer', 'horizontal');
    // this.mountPointer('xPointer', 'vertical');
    let year = 1800;
    let index = 0;

    let timeline = this._data.timeline;
    let length = timeline.length;
    // this.updateScale();
    this.mountPointer('yPointer', 'horizontal');
    this.mountPointer('xPointer', 'vertical');
    // this.render();
    setInterval(() => {
      this.compute(timeline[index]);
      index = ++index % length;
      this.updateScale();


      this.render();
    }, 1000)

  }
  compute (filter) {

    let index = this._data.timeline.indexOf(filter);
    let filterData = this._data.series[index];
    this._computed = filterData;
    console.log(this._computed);
  }
  render () {

    let self = this;
    let custom = d3.select(this._custom);
    let updates = custom.selectAll('circle').data(this._computed);
    let exits = updates.exit();
    let enters = updates.enter().append('circle');
    updates.merge(enters).attr('cx', d => this._scales.h['Income'](d[0]))
      .attr('cy', d => this._scales.v['LifeExpectancy'](d[1]))
      .attr('fill', d => this._scales.color(d[3]))
      .attr('r', d => {
        return this._scales.sScale(d[2])
      });
    updates.each(function (d) {
      let node = d3.select(this);
      let circle = self._container.childOfName(node.attr('id'));
      let [cx, cy, r] = [+node.attr('cx'), +node.attr('cy'), +node.attr('r')];
      circle.animateTo({
        shape: { r, cx, cy },
      });
    })
    enters.each(function (d) {
      let node = d3.select(this);
      let circle = new zrender.Circle({
        shape: { cx: +node.attr('cx'), cy: +node.attr('cy'), r: 0 },
        style: {
          fill: node.attr('fill'), opacity: 0.7, shadowBlur: 10, shadowOffsetX: 0,
          shadowOffsetY: 0, shadowColor: 'rgba(0,0,0,0.5)'
        },
      });
      circle.animateTo({
        shape: { cx: +node.attr('cx'), cy: +node.attr('cy'), r: +node.attr('r') }
      })
      circle.attr('name', "" + circle.id);
      node.attr('id', circle.id);
      self._container.add(circle);

    });
  }
  refresh () {
    this.resize();
    this.updateScale();
    this.mountPointer('yPointer', 'horizontal');
    this.mountPointer('xPointer', 'vertical');
  }
  init () {
    this._scales.v['LifeExpectancy'] = d3.scaleLinear();
    this._scales.yScale = this._scales.v['LifeExpectancy'];
    this._scales.h['Income'] = d3.scaleLog();
    this._scales.xScale = this._scales.h['Income'];
    this._scales.color = d3.scaleOrdinal().range(['#bcd3bb', '#e88f70', '#edc1a5', '#9dc5c8', '#e1e8c8', '#7b7c68', '#e5b5b5', '#f0b489', '#928ea8', '#bda29a']);
    this._scales.sScale = d3.scaleSqrt().range([5, 50])
    this._xAxis = new zrender.Group();
    this._xAxis.attr('position', [0, this._opt.cH + 0.5]);
    this._xAxis.attr('name', 'xAxis');
    this._container.add(this._xAxis);
    this._yAxis = new zrender.Group();
    this._yAxis.attr('name', 'yAxis');
    this._yAxis.attr('position', [0.5, 0]);
    this._container.add(this._yAxis);
    this._yPointer = new zrender.Group();
    this._yPointer.attr('name', 'yPointer');
    this._container.add(this._yPointer);

    this._xPointer = new zrender.Group();
    this._xPointer.attr('name', 'xPointer');
    this._container.add(this._xPointer);
  }
  updateScale () {
    this._scales.v['LifeExpectancy'].range([this._opt.cH, 0]).domain([0, 100]);
    this._scales.h['Income'].range([0, this._opt.cW]).domain([300, 100000]);
    console.log(this._scales.h['Income'].domain())
    this._scales.sScale.domain(d3.extent(this._computed, i => i[2]));
    this.mountAxis('xAxis', this._scales.h['Income'], { orient: 'bottom', position: 'middle', textFill: '#fff', ticks: null, })
    this.mountAxis('yAxis', this._scales.v['LifeExpectancy'], { orient: 'left', position: 'top', textFill: '#fff', ticks: 5, })
  }
  mountPointer (name, orient) {
    let parentGroup = this._container.childOfName(name);
    if (orient === 'vertical') {
      vLinePointer(this, { trigger: 'axis', continuous: true, stroke: '#fff', lineDash: [5, 5] }, parentGroup);
    } else {
      hLinePointer(this, { trigger: 'axis', continuous: true, stroke: '#fff', lineDash: [5, 5] }, parentGroup)
    }


  }
  mountAxis (name, scale, opt) {
    let parentGroup = this._container.childOfName(name);
    AxisBuilder(scale, { ...this._opt, ...opt }, parentGroup);
  }
}