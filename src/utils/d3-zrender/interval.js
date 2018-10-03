import zrender from 'zrender';
import Chart from './base';
import { AxisBuilder } from './AxisBuilder'
export default class Interval extends Chart {
  constructor(elm, opt) {
    super(elm, opt);
    this.init();
  }
  init () {
    this._pList = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];
    this._iList = ['dataGDP', 'dataSI', 'dataPI', 'dataTI', 'dataEstate', 'dataFinancial'];
    this._yList = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011];
    this._scales.v['value'] = d3.scaleLinear().range([this._opt.cH, 0]);
    this._scales.h['mainCategory'] = d3.scaleBand().range([0, this._opt.cW]).padding(0.2);
    this._scales.h['category'] = d3.scaleBand().paddingInner(0.2);
    this._scales.color = d3.scaleOrdinal(d3.schemePastel1);
    let g1 = new zrender.Group();
    g1.name = 'vertical';
    g1.position = [0.5, 0.5];
    this._container.add(g1);

    let g2 = new zrender.Group();
    g2.name = 'horizontal';
    g2.position = [0.5, this._opt.cH + 0.5];
    this._container.add(g2);
    // this.mountAxis(g2.name);

  }
  render () {

    let self = this;
    let allWidth = this._scales.h['mainCategory'].bandwidth();
    let singleWidth = parseInt(allWidth / 6);
    // self._graphGroup.removeAll();
    // self._zr.refresh();
    let custom = d3.select(this._custom);
    let updates = custom.selectAll('custom.rect').data(this._computed);
    let enters = updates.enter().append('custom').attr('class', 'rect');
    let exits = updates.exit();
    exits.remove();

    let graphs = custom.selectAll('custom.rect');
    let subUpdates = graphs.selectAll('custom.sub').data(function (d) {
      let subs = [];
      for (let key of Object.keys(d)) {
        if (key !== 'province' && key !== 'year') {
          subs.push({ province: d['province'], name: key, value: d[key] });
        }
      }
      return subs;
    });
    let oldChildrenLength = 0;
    let subEnters = subUpdates.enter().append('custom').attr('class', 'sub');
    let subExits = subUpdates.exit().remove();
    subUpdates.attr('fill', d => self._scales.color(d.name)).transition().duration(500).attr('height', d => self._opt.cH - self._scales.v['value'](d.value))
      .attr('y', d => self._scales.v['value'](d.value));
    subEnters.attr('fill', d => self._scales.color(d.name)).attr('width', singleWidth).attr('x', (d, i) =>
      self._scales.h['mainCategory'](d.province) + i * singleWidth)
      .attr('y', self._opt.cH)
      .attr('height', 0)
      .transition().duration(500)
      .attr('height', d => self._opt.cH - self._scales.v['value'](d.value))
      .attr('y', d => self._scales.v['value'](d.value));

    let t = d3.timer(function (elapsed) {
      self._graphGroup.removeAll();
      if (elapsed > 1000) {
        t.stop();
      }
      // self._graphGroup.removeAll();
      subUpdates.merge(subEnters).each(function (d) {
        let node = d3.select(this);
        let rect = new zrender.Rect({
          shape: { width: node.attr('width'), height: node.attr('height') },
          style: { fill: node.attr('fill') },
          position: [node.attr('x'), node.attr('y')]
        });
        self._graphGroup.add(rect);
      });
      oldChildrenLength = self._graphGroup._children.length;

    })
  }
  updateData (data) {
    this._data = data || this._data;
    if (this._data == null || Object.prototype.toString.call(this._data) !== '[object Array]') return;
    this.update(2002);
  }
  update (year) {
    this.compute(year);
    this.mountAxis('horizontal');
    this.mountAxis('vertical');
    this.render();

  }
  compute (filter) {
    let data = [];
    // 计算最大值

    for (let d of this._data) {
      if (d.year === filter) {
        data.push(Object.assign({}, d))
      }
    }
    this._computed = data;

    this._max = d3.max(this._computed, d => {
      let values = Object.values(d);
      let tempArr = values.filter(i => typeof i === 'number');
      return d3.max(tempArr);
    })

  }
  mountAxis (name) {
    if (this._data == null || Object.prototype.toString.call(this._data) !== '[object Array]') return;
    if (name === 'horizontal') {
      let parentGroup = this._container.childOfName(name);
      // 卸载旧的坐标轴
      parentGroup.removeAll();
      // 通过数据更新比例尺
      this._scales.h['mainCategory'].domain(this._computed.map(i => i.province));
      this._scales.h['category'].domain(Object.keys(this._computed[0]).filter(i => i !== 'province' && i !== 'year'))
        .range([0, this._scales.h['mainCategory'].bandwidth()]);
      let childGroup = AxisBuilder(this._scales.h['mainCategory'], { ...this._opt, name: name, orient: 'bottom', tickArguments: 5 }, this);
      parentGroup.add(childGroup);
      this._zr.refresh();
    } else if (name === 'vertical') {
      let parentGroup = this._container.childOfName(name);
      parentGroup.removeAll();
      this._scales.v['value'].domain([0, this._max]);
      let childGroup = AxisBuilder(this._scales.v['value'], { ...this._opt, name: name, orient: 'left', tickArguments: 5 });
      parentGroup.add(childGroup);
    }

  }
}