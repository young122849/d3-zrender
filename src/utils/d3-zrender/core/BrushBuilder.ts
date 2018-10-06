declare var zrender: any;
import { fixCoordinate } from '../helper/fix';
import { baseOption } from './base';
interface BrushBuilderOption extends baseOption {
  name: string;
  extent: number[];
}
type handleBrushFn = (active: boolean, name: string, selection: number[], context: any) => void;
type BrushBuilderFn = (opt: BrushBuilderOption, group: any, context: any) => void;

let handleBrush: handleBrushFn = function (active, name, selection, context) {
  let index: number = context._actives.findIndex((i: any) => i.key === name);
  if (!active) {
    // 取消Brush
    if (index === -1) return;
    context._actives.splice(index, 1);
  } else {
    if (index === -1) context._actives.push({ key: name, extent: [selection[0], selection[1]] });
    else context._actives.splice(index, 1, { key: name, extent: [selection[0], selection[1]] });
  }
  // context.handleSelection();
}

let BrushY: BrushBuilderFn = function (opt, group, context) {
  let oldGroup = group.childOfName("y-brush-" + opt.name);
  if (oldGroup != null) {
    // 如果存在旧的坐标轴组,应该将其删除
    group.remove(oldGroup);
  }
  let newGroup = new zrender.Group({ name: "y-brush-" + opt.name });
  group.add(newGroup);
  let active: boolean = false; // 用来标识是否有刷选
  let extent = new zrender.Rect({
    shape: { width: opt.extent[0], height: opt.extent[1] },
    style: { fill: 'transparent' },
    position: [-1 * opt.extent[0] / 2, 0],
    name: 'extent',
    cursor: 'crosshair',
  });
  newGroup.add(extent);
  let selection = new zrender.Rect({
    shape: { width: opt.extent[0], height: 10 },
    style: { stroke: '#000', fill: 'transparent', lineDash: [5, 5] },
    position: [-1 * opt.extent[0] / 2, 0],
    draggable: true,
    cursor: 'move',
    name: 'selection'
  });
  selection.hide();
  newGroup.add(selection);
  extent.on('mousedown', function (ev: any) {
    let originY = fixCoordinate(ev, opt)[1];
    selection.attr('position', [-1 * opt.extent[0] / 2, originY]);
    selection.hide();
    active = false;
    function onMouseMove(ev: any) {
      selection.show();
      active = true;
      let distY = fixCoordinate(ev, opt)[1] - originY;
      selection.attr('shape', { height: distY });
    }
    function onMouseUp(ev: any) {
      let s = [selection.position[1], selection.position[1] + selection.shape.height];
      handleBrush(active, opt.name, s, context);
      this.off('mousemove', onMouseMove);
      context._zr.off('mouseup', onMouseUp);
      context._zr.off('mousemove', onMouseMove);
    }
    this.on('mousemove', onMouseMove);
    context._zr.on('mousemove', onMouseMove)
    context._zr.on('mouseup', onMouseUp, extent);
  });
  selection.on('dragstart', function (ev: any) {
    let distY = fixCoordinate(ev, opt)[1] - this.position[1];
    this.on('drag', function (ev: any) {
      ev.cancelBubble = true;
      let pos1 = fixCoordinate(ev, opt)[1] - distY;
      let height = this.shape.height;
      pos1 = pos1 < 0 ? 0 : pos1;
      pos1 = pos1 + height > opt.cH ? opt.cH - height : pos1;
      selection.attr('position', [-1 * opt.extent[0] / 2, pos1]);
    });
    this.on('dragend', function () {
      this.off('drag');
      this.off('dragend');
      let s = [this.position[1], this.position[1] + this.shape.height];
      handleBrush(active, opt.name, s, context);
    });
  })

}

export { BrushY }
