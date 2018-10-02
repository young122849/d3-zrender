import zrender from 'zrender';
import { fixCoordinate } from './helper/fix';
function AxisTicksBuilder (scale, tickArguments) {

  let ticks = [];
  if (scale.bandwidth != null) {
    // 当前比例尺为scaleBand

    ticks = scale.domain().map(d => ({
      pos: scale(d),
      value: d
    }));

  } else {
    ticks = scale.ticks(tickArguments).map(d => ({
      pos: scale(d),
      value: d
    }));
    ticks.push({
      pos: 0,
      value: ''
    });
    ticks.push({
      pos: scale.range()[1],
      value: ''
    })
  };
  return ticks;

}

export function AxisBuilder (scale, opt, context) {

  let ticks = AxisTicksBuilder(scale, opt.tickArguments);

  let labelTicks = [], adjustX = -1, adjustY = -1;
  let baseOriginY = 0, baseEndY = 5, baseOriginX = 0, baseEndX = 5;
  let g = new zrender.Group();
  let name = new zrender.Text({
    style: {
      text: opt.name,
      textFill: '#000',
      textAlign: 'center',
      fontSize: 18.5
    },
    draggable: true,
    position: [-3, -25]
  });
  name.on('dragstart', function () {
    let pos0 = this.position[0];
    let pos1 = this.position[1];
    this.on('drag', function () {
      this.position = [pos0, pos1];
    });
  });
  g.add(name);

  // g.on('dragstart', function (ev) {

  //   let pos1 = this.position[1];
  //   function onDrag (ev) {
  //     let [offsetX, offsetY] = fixCoordinate(ev, opt);

  //     let distX = offsetX - originX;
  //     this.position = [parseInt(offsetX) + 0.5, pos1];
  //     context._axisGroup.remove(g);
  //     context._axisGroup.add(g);

  //   }
  //   this.on('drag', onDrag)
  //   this.on('dragend', function (ev) {
  //     let newTick = { pos: this.position[0], value: opt.name };
  //     context.reorder(newTick)
  //   })

  // });
  // g.position = opt.position;
  switch (opt.orient) {
    case 'bottom':
      g.add(new zrender.Line({
        shape: {
          x1: 0,
          y1: 0.5,
          x2: opt.cWidth,
          y2: 0.5
        },
      }));
      labelTicks = ticks.map(tick => {
        adjustX = Math.round(tick.pos) + 0.5;
        return {
          ...tick,
          x1: adjustX,
          y1: baseOriginY,
          x2: adjustX,
          y2: baseEndY,
          x3: adjustX,
          y3: opt.height,
          textAlign: 'center'
        }
      })
      break;
    case 'right':
      let temp = new zrender.Line({
        shape: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: opt.cHeight
        },
      })
      g.add(temp);

      labelTicks = ticks.map(tick => {
        adjustY = Math.round(tick.pos) + 0.5;
        return {
          ...tick,
          x1: baseOriginX,
          y1: adjustY,
          x2: baseEndX,
          y2: adjustY,
          x3: opt.width,
          y3: adjustY,
          textAlign: 'left',
          textVerticalAlign: 'middle'
        }
      })
      break;
  }

  labelTicks.forEach(item => {
    // 添加刻度线
    g.add(new zrender.Line({
      shape: {
        x1: item.x1,
        y1: item.y1,
        x2: item.x2,
        y2: item.y2
      },
      style: {
        'stroke': '#000'
      }
    }));
    // 添加刻度文字
    g.add(new zrender.Text({
      style: {
        text: item.value,
        textFill: '#000',
        textAlign: item.textAlign ? item.textAlign : null,
        textVerticalAlign: item.textVerticalAlign ? item.textVerticalAlign : null
      },
      position: [item.x2 + 2, item.y2]
    }));
    // 添加比例尺名称

  })

  return g;
}
