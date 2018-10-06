declare var zrender: any;
import { fixCoordinate } from "../helper/fix";
import { baseOption } from './base';
interface AxisBuilderOption extends baseOption {
  orient: string; // 坐标轴方向
  stroke?: string; // 坐标轴线填充色
  draggable?: boolean; // 是否可拖拽
  ticks?: number;
  tickFormatter?: string | any;
  tickSize?: number;
  textFill?: string;
  name: string;
}
type AxisBuilderFn = (scale: any, opt: AxisBuilderOption, group: any, context: any) => void;
type AxisTicksBuilderFn = (scale: any, opt: AxisBuilderOption) => any;
type tick = { pos: number, value: any };
export const defaultAxisBuilderOption: AxisBuilderOption = {
  orient: '',
  name: '',
  tickSize: 5,
  textFill: '#000',
  stroke: '#000'
}

/**
 * 该函数负责生成刻度位置并生成刻度线与刻度值文字
 * @param scale d3-scale
 * @param opt AxisBuilderOption
 */
let AxisTicksBuilder: AxisTicksBuilderFn = function (scale, opt) {
  let ticks: tick[] = [];
  // 判断坐标轴是否使用的是连续比例尺
  if (scale.bandwidth) {
    // scaleBand or scalePoint
    let bandwidth = scale.bandwidth();

    scale.domain().forEach((d: any) => ticks.push({ pos: scale(d) + bandwidth / 2, value: d }));
    // 通常情况下因为设置了paddingInner与paddingOuter,导致第一个与最后一个刻度不在起始与终止位置
    // 因此需要特殊处理
    ticks.push({ pos: scale.range()[0], value: '' });
    ticks.push({ pos: scale.range()[1], value: '' });
  } else {
    // 使用的是连续比例尺
    // 如果传入了ticks或tickFormatter则需要对刻度值进行处理
    if (opt.ticks && opt.tickFormatter) {
      let values = scale.ticks(opt.ticks);
      let formatter = scale.tickFormat(opt.ticks, opt.tickFormatter);
      values.forEach((d: any) => ticks.push({ pos: scale(d), value: formatter(d) }));
    } else if (opt.ticks) {
      let values = scale.ticks(opt.ticks);
      values.forEach((d: any) => ticks.push({ pos: scale(d), value: d }));
    } else if (opt.tickFormatter) {
      let formatter = scale.tickFormat(opt.ticks, opt.tickFormatter);
      scale.domain().forEach((d: any) => ticks.push({ pos: scale(d), value: formatter(d) }));
    } else {
      scale.ticks().forEach((d: any) => ticks.push({ pos: scale(d), value: d }));
    }
  }

  // 利用该g标签存放所有的刻度线与标签文字
  let g = new zrender.Group();
  g.attr('name', 'ticks');
  switch (opt.orient) {
    case 'bottom': {
      ticks.forEach(tick => {
        g.add(new zrender.Line({
          shape: { x1: parseInt("" + tick.pos), y1: 0, x2: parseInt("" + tick.pos), y2: opt.tickSize },
          style: { stroke: opt.stroke }
        }));
        g.add(new zrender.Text({
          style: { textFill: opt.textFill, textAlign: 'center', text: tick.value },
          position: [parseInt("" + tick.pos), opt.tickSize + 2]
        }));
      });
      break;
    }
    case 'right': {
      ticks.forEach(tick => {
        g.add(new zrender.Line({
          shape: { x1: 0, y1: parseInt("" + tick.pos), x2: opt.tickSize, y2: parseInt("" + tick.pos) },
          style: { stroke: opt.stroke }
        }));
        g.add(new zrender.Text({
          style: { textFill: opt.textFill, textAlign: 'left', text: tick.value, textVerticalAlign: 'middle' },
          position: [opt.tickSize + 2, parseInt("" + tick.pos)]
        }));
      });
      break;
    }
    case 'top': {
      ticks.forEach(tick => {
        g.add(new zrender.Line({
          shape: { x1: parseInt("" + tick.pos), y1: 0, x2: parseInt("" + tick.pos), y2: -opt.tickSize },
          style: { stroke: opt.stroke }
        }));
        g.add(new zrender.Text({
          style: { textFill: opt.textFill, textAlign: 'center', text: tick.value, textVerticalAlign: 'bottom' },
          position: [parseInt("" + tick.pos), -opt.tickSize - 2]
        }));
      });
      break;
    }
    case 'left': {
      ticks.forEach(tick => {
        g.add(new zrender.Line({
          shape: { x1: 0, y1: parseInt("" + tick.pos), x2: -opt.tickSize, y2: parseInt("" + tick.pos) },
          style: { stroke: opt.stroke }
        }));
        g.add(new zrender.Text({
          style: { textFill: opt.textFill, textAlign: 'right', text: tick.value, textVerticalAlign: 'middle' },
          position: [-opt.tickSize - 2, parseInt("" + tick.pos)]
        }));
      });
      break;
    }
  }
  return g;
}


/**
 * 该函数负责在group下添加组件
 * @param scale d3-scale
 * @param opt AxisBuilderOption
 * @param group zrender Group 在该group下添加坐标轴线与刻度线以及刻度值文字
 * @param context 图表实例,用于在拖动坐标轴后调用对应函数
 */
let AxisBuilder: AxisBuilderFn = function (scale, opt, group, context) {
  // 合并配置
  opt = { ...opt, ...defaultAxisBuilderOption };
  // 如果存在旧的坐标轴组,应该将其删除
  let oldGroup = group.childOfName("axis-" + opt.name);
  if (oldGroup != null) group.remove(oldGroup);

  let newGroup = new zrender.Group({ name: "axis-" + opt.name });
  group.add(newGroup);
  let g = AxisTicksBuilder(scale, opt);
  // // 每一次新建坐标轴时,应该将之前的坐标轴删除
  // // 删除之前坐标轴的坐标轴线,刻度线以及标签
  // group.removeAll();
  newGroup.add(g);

  // 根据坐标轴的方向创建不同的坐标轴
  switch (opt.orient) {
    case 'left':
    case 'right':
      {
        // 首先添加坐标轴线
        // 当坐标轴方向为left与right时,坐标轴线的长度相同
        newGroup.add(new zrender.Line({
          shape: { x1: 0, y1: 0, x2: 0, y2: opt.cH },
          style: { stroke: opt.stroke || '#000' }
        }));
        // 添加坐标轴名称
        let name = new zrender.Text({
          style: { textFill: opt.textFill || '#000', textAlign: 'center', text: opt.name, fontSize: 20 },
          draggable: true,
          position: [0, -30]
        });
        let position = [...name.position];

        name.on('drag', function () {
          this.attr('position', position);
        });

        newGroup.add(name);
        // 当需要拖拽坐标轴时,应该给group添加相应事件处理器
        // 但应该给父group添加
        if (opt.draggable) {
          group.on('drag', function (ev: any) {
            // 拖拽垂直坐标轴时应该保持group的垂直偏移量不变
            let pos1: number = this.position[1];
            // 需要修正坐标轴
            let offsetX: number = fixCoordinate(ev, opt)[0];
            this.attr('position', [offsetX, pos1]);
          });
        }
        break;
      }
    case 'top':
    case 'bottom':
      {
        // 首先添加坐标轴线
        // 当坐标轴方向为top与bottom时,坐标轴线的长度相同
        group.add(new zrender.Line({
          shape: { x1: 0, y1: 0, x2: opt.cW, y2: 0 },
          style: { stroke: opt.stroke || '#000' }
        }));
        if (opt.draggable) {
          group.on('drag', function (ev: any) {
            // 拖拽垂直坐标轴时应该保持group的水平偏移量不变
            let pos0: number = this.position[0];
            // 需要修正坐标轴
            let offsetY: number = fixCoordinate(ev, opt)[1];
            this.attr('position', [offsetY, pos0]);
          });
        }
        break;
      }
  }
}
export { AxisBuilder }