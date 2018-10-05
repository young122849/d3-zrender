import { fixCoordinate } from "./helper/fix";
import zrender from 'zrender';
function findCloest (ticks, pos, bandwidth) {
  if (bandwidth === 0) {
    let step = parseInt(ticks[1] - ticks[0] / 2);
    return ticks.find(i => Math.abs(pos - i.pos) < step);
  } else {
    let step = parseInt(bandwidth / 2);
    return ticks.find(i => Math.abs(pos - i.pos) < step);
  }
}

export function hLinePointer (context, newOpt, parentGroup) {
  parentGroup.removeAll();
  parentGroup.hide();
  let opt = { ...context._opt, ...newOpt };
  let line = new zrender.Line({
    shape: { x1: 0, y1: 0.5, x2: opt.cW, y2: 0.5 },
    style: { stroke: opt.stroke || '#000' }
  });
  let label = new zrender.Rect({
    shape: { width: 50, height: 18 },
    style: { fill: '#283b56', textFill: '#fff' },
    position: [-52, -9]
  });

  parentGroup.add(line);
  parentGroup.add(label);
  function onMouseMoved (ev) {

    let [offsetX, offsetY] = fixCoordinate(ev, opt);
    if (offsetX < 0 || offsetX > opt.cW || offsetY < 0 || offsetY > opt.cH) {
      parentGroup.hide();
      return;
    }

    parentGroup.show();
    if (opt.trigger === 'axis') {
      if (opt.continuous === true) {
        parentGroup.attr('position', [0, offsetY]);
        label.attr({ style: { text: parseFloat(this._scales.yScale.invert(offsetY)).toFixed(2) } })
      }
    }
  }
  context._zr.on('mousemove', onMouseMoved, context);
}

export function vLinePointer (context, newOpt, parentGroup) {
  // let parentGroup = context._container.childOfName('vPointer');
  parentGroup.removeAll();
  parentGroup.hide();
  let opt = { ...context._opt, ...newOpt };
  let line = new zrender.Line({
    shape: { x1: 0, y1: 0, x2: 0, y2: opt.cH },
    style: { stroke: opt.stroke || '#000', lineDash: opt.lineDash || null }
  });
  let label = new zrender.Rect({
    shape: { width: 50, height: 20 },
    style: { fill: '#283b56', textFill: '#fff' },
    position: [-25, opt.cH + 2]
  });
  parentGroup.add(label);
  parentGroup.add(line);
  function onMouseMoved (ev) {
    // 获取指示器的父级Group
    let [offsetX, offsetY] = fixCoordinate(ev, opt);
    if (offsetX < 0 || offsetX > opt.cW || offsetY < 0 || offsetY > opt.cH) {
      parentGroup.hide();
      return;
    }
    parentGroup.show();
    // 根据坐标轴来触发指示器
    // 在装载指示器时，应当预先将坐标轴关键位置记录下来
    if (opt.trigger === 'axis') {
      if (opt.continuous) {
        label.attr({ style: { text: parseInt(context._scales.xScale.invert(offsetX)) } })
        parentGroup.attr('position', [offsetX + 0.5, 0])
      } else {
        // 获取坐标轴的刻度位置
        let ticks = this._scales.xScale.domain().map(i => ({ pos: this._scales.xScale(i) + this._scales.xScale.bandwidth() / 2, value: i }));
        // 水平坐标轴使用的是非连续比例尺
        let cloest = findCloest(ticks, offsetX, this._scales.xScale.bandwidth());
        // console.log(cloest)
        if (cloest != null) {
          parentGroup.attr('position', [parseInt(cloest.pos) + 0.5, 0]);
          label.attr({ style: { text: cloest.value } })
        }
      }
    }

  }
  context._zr.on('mousemove', onMouseMoved, context);
}

export function vShadowPointer (context, newOpt) {
  let parentGroup = context._container.childOfName('vShadow');
  function onMouseMoved (ev) {

    //每次鼠标移动时应该将旧指示器删除
    parentGroup.removeAll();
    // 将执行上下文修改为context
    let opt = Object.assign({}, this._opt, newOpt);
    let [offsetX, offsetY] = fixCoordinate(ev, opt);
    if (offsetX < 0 || offsetX > opt.cW || offsetY < 0 || offsetY > opt.cH) return;
    // 获取坐标轴的刻度位置
    let ticks = this._scales.xScale.domain().map(i => ({ pos: this._scales.xScale(i) + this._scales.xScale.bandwidth() / 2, value: i }));
    // 水平坐标轴使用的是非连续比例尺
    let cloest = findCloest(ticks, offsetX, this._scales.xScale.bandwidth());
    if (cloest != null) {
      let shadow = new zrender.Rect({
        shape: { width: this._scales.xScale.bandwidth(), height: this._opt.cH },
        style: { fill: '#CCD6EC', opacity: 0.3 },
        position: [cloest.pos - this._scales.xScale.bandwidth() / 2, 0.5]
      })
      // let label = new zrender.Rect({
      //   shape: { width: 40, height: 18 },
      //   style: { fill: '#283b56', text: cloest.value, textFill: '#fff' },
      //   position: [cloest.pos - 20, opt.cH + 2]
      // });
      parentGroup.add(shadow);
      // parentGroup.add(label);
    }
  }
  context._zr.dom.addEventListener('mouseout', function (ev) {
    parentGroup.removeAll();
    context._zr.refresh();
  })
  context._zr.on('mousemove', onMouseMoved, context);
}