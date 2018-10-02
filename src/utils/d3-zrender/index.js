import zrender from 'zrender';
import { AxisBuilder } from './AxisBuilder'
import { TooltipBuilder } from './TooltipBuilder'
import { AxisPointerBuilder } from './AxisPointerBuilder';
import { BrushXBuilder } from './BrushBuilder';
import { throttle } from '../optimize/index'
export default class Chart {
  constructor(elm, opt) {
    elm = typeof elm === 'string' ? document.querySelector(elm) : elm;
    this._zr = zrender.init(elm);
    let defaultConfig = { margin: { top: 50, right: 50, bottom: 50, left: 50 } };
    opt = Object.assign({}, defaultConfig, opt);
    this._scales = {};
    this._opt = opt;
    this._timer = null;
    this._pointer = 'cross'
    this._scales.xScale = d3.scalePoint();
    this._scales.vertical = this._scales.xScale;
    this._brushIds = [];

    this._scales.yScale = d3.scaleLinear();
    this._scales.horizontal = this._scales.yScale;
    this._scales.zScale = d3.scaleOrdinal(d3.schemePastel1);
    this._custom = document.createElement('custom');
    this._axisGroup = new zrender.Group();
    this._pointerGroup = new zrender.Group();
    this._graphGroup = new zrender.Group();
    this._brushGroup = new zrender.Group();
    this._verticalPointerGroup = new zrender.Group();
    this._horizontalPointerGroup = new zrender.Group();
    this._crossPointerGroup = new zrender.Group();
    this._container = new zrender.Group();
    this._container.position = [this._opt.margin.left, this._opt.margin.top];
    this._container.add(this._axisGroup);
    this._container.add(this._graphGroup);
    this._container.add(this._horizontalPointerGroup);
    this._container.add(this._verticalPointerGroup);
    this._container.add(this._crossPointerGroup);
    this._container.add(this._brushGroup);

    this.mountTooltip();


    this._zr.add(this._container);
  }
  mountQuadtree () {
    this.quadtree = d3.quadtree().x(d => d.x).y(d => d.y)
  }
  mountBrush () {

    BrushXBuilder(this, Object.assign({}, this._opt, { extent: [20, this._opt.cHeight], position: [680.5, 0.5] }));
    BrushXBuilder(this, Object.assign({}, this._opt, { extent: [20, this._opt.cHeight], position: [500.5, 0.5] }))

  }
  mountTooltip () {
    TooltipBuilder(this);
    // this._zr.on('mousemove', throttle(100, this.updateTooltip), this);
    // this._zr.on('mouseout', this.updateTooltip, this);
  }
  mountPointer () {
    // AxisPointerBuilder(this, { type: 'line', orient: 'vertical' })
    // AxisPointerBuilder(this, { type: 'line', orient: 'horizontal' })
    AxisPointerBuilder(this, { type: 'cross', })
  }
  resize () {
    let [width, height] = [this._zr.getWidth(), this._zr.getHeight()];
    let [cWidth, cHeight] = [width - this._opt.margin.left - this._opt.margin.right, height - this._opt.margin.top - this._opt.margin.bottom];
    this._opt = { ...this._opt, width, height, cWidth, cHeight };
    this.mountPointer()
    this.mountBrush();
  }
  updateData (data) {
    this.data = data || this.data;
    if (this.data == null || Object.prototype.toString.call(this.data) !== '[object Array]') return;
    // 更新坐标轴
    this.resize();
    this.updateAxis();
    this.computed();
    this.render();
  }
  computed () {
    let stack = d3.stack().keys(Object.keys(this.data[0]).filter(item => item != 'hour'))
      .order(d3.stackOrderNone).offset(d3.stackOffsetNone);
    this.stackData = stack(this.data);
    this.mountQuadtree();
  }
  render () {
    let self = this;
    self._graphGroup.removeAll();

    let timer = null;
    let area = d3.area().x(d => {
      let x = this._scales.xScale(d.data.hour);
      // canvas太坑了
      if (x === 0) {
        x += 0.5
      } else if (x === this._opt.cWidth) {
        x -= 0.5
      }
      return x;
    }).y0(d => this._scales.yScale(d[0]) === 0 ? 0.5 : this._scales.yScale(d[0]))
      .y1(d => this._scales.yScale(d[1]))
    // .curve(d3.curveBasis)
    let updates = d3.select(this._custom).selectAll('custom.rect').data(this.stackData);
    let enters = updates.enter().append('custom').attr('class', 'rect');
    let exits = updates.exit();

    let graphs = d3.select(self._custom).selectAll('custom.rect')
      .attr('d', d => area(d));
    // self._graphGroup.removeAll();

    // 利用createFromString可以

    let allPoints = []

    // self._zr.refresh();
    graphs.each(function (d) {
      let result2 = zrender.path.createFromString(d3.select(this).attr('d'), {
        style: { lineWidth: 1, fill: self._scales.zScale(d.key), stroke: '#ccc' },
      })
      self._graphGroup.add(result2);
      d.forEach(item => {
        let x = self._scales.xScale(item.data.hour), y = self._scales.yScale(item[1])
        allPoints.push([x, y]);
        self.quadtree.add({ x, y, xValue: item.data.hour, yValue: item[1] })
      })
    });
    allPoints.forEach(item => {
      self._graphGroup.add(new zrender.Circle({
        shape: { cx: parseInt(item[0]), cy: parseInt(item[1]), r: 2 },
        style: { fill: 'white', stroke: '#ccc' },
        // zlevel: 5,
      }))
    })
  }
  updateAxis () {
    this._axisGroup.removeAll();
    this._scales.xScale.domain(this.data.map(item => item.hour)).range([0, this._opt.cWidth]);
    this._scales.yScale.domain([0, 800]).rangeRound([this._opt.cHeight, 0]);
    this._scales.zScale.domain(Object.keys(this.data[0]).filter(item => item != 'hour'))
    this._axisGroup.add(AxisBuilder(this._scales.xScale, { ...this._opt, orient: 'bottom' }));
    this._axisGroup.add(AxisBuilder(this._scales.yScale, { ...this._opt, orient: 'left' }));
  }
}