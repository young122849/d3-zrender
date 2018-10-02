import zrender from 'zrender';
import { fixCoordinate } from './helper/fix';

function handleBrush (context, opt, brushRect) {
  let index = context._actives.findIndex(i => i.key === opt.key);
  if (brushRect == null) {
    // 取消Brush
    if (index === -1) return;
    context._actives.splice(index, 1);
  } else {
    if (index === -1) context._actives.push({ key: opt.key, extent: [brushRect.position[1], brushRect.position[1] + brushRect.shape.height] });
    else context._actives.splice(index, 1, { key: opt.key, extent: [brushRect.position[1], brushRect.position[1] + brushRect.shape.height] });
  }
  context.render();
}

export function BrushXBuilder (context, opt) {
  let g = new zrender.Group();
  g.position = opt.position;
  // 添加背景rect，响应鼠标事件
  let extent = new zrender.Rect({
    shape: { width: opt.extent[0], height: opt.extent[1] },
    style: { fill: 'transparent', stroke: 'transparent' },
    position: [-1 * opt.extent[0] / 2, 0],
    cursor: 'crosshair'
  });
  let brushXGroup = new zrender.Group();
  g.add(extent);
  g.add(brushXGroup);

  extent.on('mousedown', function (ev) {
    let [originX, originY] = fixCoordinate(ev, opt);
    brushXGroup.removeAll();
    context._zr.refresh();
    let brushRect = null;
    // let index = context._actives.findIndex(i => i.key === opt.key);
    // context._actives[index].extent = [0, 0];
    function onMouseMove (ev) {
      brushRect = null;
      let distY = fixCoordinate(ev, opt)[1] - originY;
      brushXGroup.removeAll();
      brushRect = new zrender.Rect({
        shape: { width: opt.extent[0], height: distY },
        style: { stroke: '#000', lineDash: [5, 5], fill: 'transparent', lineWidth: 1 },
        position: [-1 * parseInt(opt.extent[0] / 2), originY],
        cursor: 'move',
        draggable: true
      });

      brushRect.on('dragstart', function (ev) {
        let distY = fixCoordinate(ev, opt)[1] - this.position[1];
        let pos0 = this.position[0];
        let self = this;
        function onDrag (ev) {
          handleBrush(context, opt, brushRect);
          let pos1 = fixCoordinate(ev, opt)[1] - distY;
          pos1 = pos1 < 0 ? 0 : pos1;
          pos1 = pos1 + self.shape.height > opt.cHeight ? opt.cHeight - self.shape.height : pos1;
          self.position = [pos0, pos1];
        }
        function onDragEnd (ev) {
          handleBrush(context, opt, brushRect);
          this.off('drag', onDrag);
          this.off('dragend', onDragEnd);
          context._zr.off('drag', onDrag);
        }
        this.on('drag', onDrag);
        this.on('dragend', onDragEnd);
        context._zr.on('drag', onDrag);
      })
      brushXGroup.add(brushRect);
    }
    function onMouseUp (ev) {

      handleBrush(context, opt, brushRect);

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