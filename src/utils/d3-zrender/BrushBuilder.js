import zrender from 'zrender';
import { fixCoordinate } from './helper/fix';
/**
 * 当出现mouseup与dragend事件时，处理brush区域
 * @param {any} context 
 * @param {any} opt 
 * @param {any} brushRect 
 */
function handleBrush (context, active, key, selection) {
  let index = context._actives.findIndex(i => i.key === key);
  if (!active) {
    // 取消Brush
    if (index === -1) return;
    context._actives.splice(index, 1);
  } else {
    if (index === -1) context._actives.push({ key, extent: [selection.position[1], selection.position[1] + selection.shape.height] });
    else context._actives.splice(index, 1, { key, extent: [selection.position[1], selection.position[1] + selection.shape.height] });
  }
  // context.compute();
  context.handleSelection();
}

export function BrushXBuilder (context, opt, parentGroup) {
  let g = parentGroup;
  let active = false;
  // 添加背景rect，响应鼠标事件
  let extent = new zrender.Rect({
    shape: { width: opt.extent[0], height: opt.extent[1] },
    style: { fill: 'transparent', stroke: 'transparent' },
    position: [-1 * opt.extent[0] / 2, 0],
    cursor: 'crosshair'
  });
  let selection = new zrender.Rect({
    shape: { width: opt.extent[0], height: 10 },
    style: { fill: 'transparent', stroke: '#000', lineDash: [5, 5] },
    position: [-1 * opt.extent[0] / 2, 0],
    draggable: true,
    cursor: 'move'
  });
  selection.on('dragstart', function (ev) {
    let distY = fixCoordinate(ev, opt)[1] - this.position[1];
    this.on('drag', function (ev) {
      ev.cancelBubble = true;
      let pos1 = fixCoordinate(ev, opt)[1] - distY;
      let height = this.shape.height;
      pos1 = pos1 < 0 ? 0 : pos1;
      pos1 = pos1 + height > opt.cH ? opt.cH - height : pos1;
      selection.attr('position', [-1 * opt.extent[0] / 2, pos1]);
    });
    this.on('dragend', function () {
      handleBrush(context, active, opt.key, selection);
    })
  })
  selection.attr('name', 'selection');
  selection.hide();
  extent.attr('name', 'extent');
  g.add(extent);
  g.add(selection);

  extent.on('mousedown', function (ev) {
    let originY = fixCoordinate(ev, opt)[1];
    selection.attr('position', [-1 * opt.extent[0] / 2, originY + 0.5]);
    selection.hide();
    active = false;
    function onMouseMove (ev) {
      selection.show();
      active = true;
      let distY = fixCoordinate(ev, opt)[1] - originY;
      selection.attr('shape', { height: distY });
    }
    function onMouseUp (ev) {
      handleBrush(context, active, opt.key, selection);
      this.off('mousemove', onMouseMove);
      context._zr.off('mouseup', onMouseUp);
      context._zr.off('mousemove', onMouseMove);
    }
    this.on('mousemove', onMouseMove);
    context._zr.on('mousemove', onMouseMove)
    context._zr.on('mouseup', onMouseUp, extent);
  });
  return g;
}