declare var zrender: any;
import { baseOption } from './base';
import { fixCoordinate } from '../helper/fix';
type tick = { pos: number, value: any };
type PointerBuilderFn = (scale: any, opt: PointerOption, group: any, context: any) => void;

interface PointerOption extends baseOption {
  name: string;
  stroke?: string;
  lineDash?: number[];
  trigger: string;
  continuous: boolean;
};

export const defaultPointerOption: PointerOption = {
  name: '',
  stroke: '#000',
  lineDash: null,
  trigger: 'axis',
  continuous: true
}

export function findCloest(ticks: any, pos: number, bandwidth: number): tick {
  let step: number = 0;
  if (bandwidth === 0) {
    step = parseInt("" + ((ticks[1].pos - ticks[0].pos) / 2));
    return ticks.find((i: any) => Math.abs(pos - i.pos) < step);
  } else {
    step = parseInt("" + (bandwidth / 2));
    return ticks.find((i: any) => Math.abs(pos - i.pos) < step);
  }
}

let vLinePointer: PointerBuilderFn = function (scale, opt, group, context) {
  // 是否有旧的指示器,若有将其删除
  let oldPointer = group.childOfName(opt.name);
  if (oldPointer != null) group.remove(oldPointer);
  let newPointer = new zrender.Group({ name: opt.name });
  group.add(newPointer);
  // 合并配置
  opt = { ...defaultPointerOption, ...opt };

  let line = new zrender.Line({
    shape: { x1: 0, y1: 0, x2: 0, y2: opt.cH },
    style: { stroke: opt.stroke, lineDash: opt.lineDash }
  });
  let label = new zrender.Rect({
    shape: { width: 50, height: 20 },
    style: { fill: '#283b56', textFill: '#fff' },
    position: [-25, opt.cH + 2]
  });
  newPointer.add(label);
  newPointer.add(line);

  function onMouseMoved(ev: any) {
    // 获取指示器的父级Group
    let [offsetX, offsetY] = fixCoordinate(ev, opt);
    if (offsetX < 0 || offsetX > opt.cW || offsetY < 0 || offsetY > opt.cH) {
      newPointer.hide();
      return;
    }
    newPointer.show();
    // 根据坐标轴来触发指示器
    // 在装载指示器时，应当预先将坐标轴关键位置记录下来
    if (opt.trigger === 'axis') {
      if (opt.continuous) {
        label.attr({ style: { text: parseInt(scale.invert(offsetX)) } })
        newPointer.attr('position', [offsetX, 0])
      } else {
        // 获取坐标轴的刻度位置
        let ticks = scale.domain().map((i: string) => ({ pos: scale(i) + scale.bandwidth() / 2, value: i }));
        // 水平坐标轴使用的是非连续比例尺
        let cloest = findCloest(ticks, offsetX, scale.bandwidth());
        // console.log(cloest)
        if (cloest != null) {
          newPointer.attr('position', [parseInt("" + cloest.pos), 0]);
          label.attr({ style: { text: cloest.value } })
        }
      }
    }
  }
  context._zr.on('mousemove', onMouseMoved, context);
}

let hLinePointer: PointerBuilderFn = function (scale, opt, group, context) {
  // 是否有旧的指示器,若有将其删除
  let oldPointer = group.childOfName(opt.name);
  if (oldPointer != null) group.remove(oldPointer);
  let newPointer = new zrender.Group({ name: opt.name });
  group.add(newPointer);
  // 合并配置
  opt = { ...defaultPointerOption, ...opt };

  let line = new zrender.Line({
    shape: { x1: 0, y1: 0, x2: opt.cW, y2: 0 },
    style: { stroke: opt.stroke, lineDash: opt.lineDash }
  });
  let label = new zrender.Rect({
    shape: { width: 50, height: 18 },
    style: { fill: '#283b56', textFill: '#fff' },
    position: [-52, -9]
  });
  newPointer.add(label);
  newPointer.add(line);

  function onMouseMoved(ev: any) {
    // 获取指示器的父级Group
    let [offsetX, offsetY] = fixCoordinate(ev, opt);
    if (offsetX < 0 || offsetX > opt.cW || offsetY < 0 || offsetY > opt.cH) {
      newPointer.hide();
      return;
    }
    newPointer.show();
    // 根据坐标轴来触发指示器
    // 在装载指示器时，应当预先将坐标轴关键位置记录下来
    if (opt.trigger === 'axis') {
      if (opt.continuous) {
        label.attr({ style: { text: parseInt(scale.invert(offsetY)) } })
        newPointer.attr('position', [0, offsetY])
      } else {
        // 获取坐标轴的刻度位置
        let ticks = scale.domain().map((i: string) => ({ pos: scale(i) + scale.bandwidth() / 2, value: i }));
        // 水平坐标轴使用的是非连续比例尺
        let cloest = findCloest(ticks, offsetY, scale.bandwidth());
        // console.log(cloest)
        if (cloest != null) {
          newPointer.attr('position', [0, parseInt("" + cloest.pos)]);
          label.attr({ style: { text: cloest.value } })
        }
      }
    }
  }
  context._zr.on('mousemove', onMouseMoved, context);
}

export { vLinePointer, hLinePointer }