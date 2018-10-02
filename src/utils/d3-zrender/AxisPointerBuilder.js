import zrender from 'zrender';
function vLinePointer (ev, opt) {
  // 创建垂直线条指示器
  let g = new zrender.Group();
  let [offsetX, offsetY] = [parseInt(ev.offsetX - opt.margin.left) + 0.5, parseInt(ev.offsetY - opt.margin.top) + 0.5];
  let scale = this._scales.vertical;
  if (offsetX < 0 || offsetX > opt.cWidth || offsetY < 0 || offsetY > opt.cHeight) return g;
  if (scale.bandwidth) {
    let ticks = scale.domain().map(item => ({ pos: scale(item), value: item }));
    let cloest = findCloest(ticks, offsetX);
    if (cloest == null) {
      return g;
    } else {
      g.add(new zrender.Line({
        shape: { x1: parseInt(cloest.pos) + 0.5, y1: 0, x2: parseInt(cloest.pos) + 0.5, y2: opt.cHeight },
        fill: { stroke: '#000' },
        zlevel: 10
      }));
      g.add(new zrender.Rect({
        shape: { width: 40, height: 18 },
        style: { fill: '#283b56', textFill: '#fff', stroke: 'transparent', text: cloest.value },
        position: [parseInt(cloest.pos) + 0.5 - 20, opt.cHeight + 2]
      }));
    }
  } else {
    g.add(new zrender.line({
      shape: { x1: offsetX, y1: 0, x2: offsetX, y2: opt.cHeight },
      fill: { stroke: '#000' },
      zlevel: 10
    }));
    g.add(new zrender.Rect({
      shape: { width: 40, height: 18 },
      style: { fill: '#283b56', textFill: '#fff', stroke: 'transparent', text: scale(offsetX) },
      position: [offsetX - 20, opt.cHeight + 2]
    }));
  }

  return g;
}

function hLinePointer (ev, opt) {
  // 创建垂直线条指示器
  let g = new zrender.Group();

  let [offsetX, offsetY] = [parseInt(ev.offsetX - opt.margin.left) + 0.5, parseInt(ev.offsetY - opt.margin.top) + 0.5];
  if (offsetX < 0 || offsetX > opt.cWidth || offsetY < 0 || offsetY > opt.cHeight) return g;
  let scale = this._scales.horizontal;

  if (scale.bandwidth) {
    let ticks = scale.domain().map(item => ({ pos: scale(item), value: item }));
    let cloest = findCloest(ticks, offsetX);
    if (cloest == null) {
      return g;
    } else {
      g.add(new zrender.Line({
        shape: { x1: 0, y1: parseInt(cloest.pos) + 0.5, x2: opt.cWidth, y2: parseInt(cloest.pos) + 0.5 },
        fill: { stroke: '#000' },
        zlevel: 10
      }));
      g.add(new zrender.Rect({
        shape: { width: 40, height: 18 },
        style: { fill: '#283b56', textFill: '#fff', stroke: 'transparent', text: cloest.value },
        position: [-41, parseInt(cloest.pos) + 2]
      }));
    }
  } else {
    g.add(new zrender.Line({
      shape: { x1: 0, y1: parseInt(offsetY) + 0.5, x2: opt.cWidth, y2: parseInt(offsetY) + 0.5 },
      fill: { stroke: '#000' },
      zlevel: 10
    }));
    g.add(new zrender.Rect({
      shape: { width: 40, height: 18 },
      style: { fill: '#283b56', textFill: '#fff', stroke: 'transparent', text: parseFloat(scale.invert(offsetY)).toFixed(2) },
      position: [-42, offsetY - 9]
    }));
  }
  return g;
}

function linePointer (ev, opt) {
  switch (opt.type) {
    case 'line': {
      if (opt.orient === 'vertical') return vLinePointer.call(this, ev, opt);
      else if (opt.orient === 'horizontal') return hLinePointer.call(this, ev, opt);
      break;
    }
  }

}

function crossPointer (ev, opt) {

  let cloestDataItem = this.quadtree.find(ev.offsetX - this._opt.margin.left, ev.offsetY - this._opt.margin.top);
  let g = new zrender.Group();
  g.add(new zrender.Line({
    shape: { x1: parseInt(cloestDataItem.x) + 0.5, y1: 0, x2: parseInt(cloestDataItem.x) + 0.5, y2: opt.cHeight },
    style: { stroke: '#ccc', lineDash: [5, 5] }
  }));
  g.add(new zrender.Line({
    shape: { x1: 0, y1: parseInt(cloestDataItem.y) + 0.5, x2: opt.cWidth, y2: parseInt(cloestDataItem.y) + 0.5 },
    style: { stroke: '#ccc', lineDash: [5, 5] }
  }));
  g.add(new zrender.Rect({
    shape: { width: 40, height: 18 },
    style: { fill: '#283b56', textFill: '#fff', text: cloestDataItem.xValue },
    position: [parseInt(cloestDataItem.x - 20.5), opt.cHeight + 2]
  }));
  g.add(new zrender.Rect({
    shape: { width: 40, height: 18 },
    style: { fill: '#283b56', textFill: '#fff', text: cloestDataItem.yValue },
    position: [-40.5, parseInt(cloestDataItem.y) - 9.5]
  }));
  g.add(new zrender.Circle({
    shape: { cx: parseInt(cloestDataItem[0]) + 0.5, cy: parseInt(cloestDataItem[1]) + 0.5, r: 5 },
    style: { stroke: '#ccc', fill: 'white' }
  }));
  return g;
}

function findCloest (ticks, pos) {
  let step = 0;
  if (ticks.length >= 2) {
    step = Math.round(ticks[1].pos - ticks[0].pos);
  }
  return ticks.find(item => Math.abs(item.pos - pos) < step / 2);
}

export function AxisPointerBuilder (context, opt) {
  opt = { ...context._opt, ...opt };

  function updatePointer (ev) {

    switch (opt.type) {
      case 'line': {
        let g = context['_' + opt.orient + 'PointerGroup'];
        g.zlevel = 10;
        g.removeAll();
        g.add(linePointer.call(this, ev, opt));
        // g.add();
        break;
      }
      case 'cross': {
        let g = context._crossPointerGroup;
        g.zlevel = 10;
        g.removeAll();
        g.add(crossPointer.call(this, ev, opt));
        break;
      }
    }
  }
  context._zr.on('mousemove', updatePointer, context);
}