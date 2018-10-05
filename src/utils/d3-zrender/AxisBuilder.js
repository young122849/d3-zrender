import zrender from 'zrender';
import { fixCoordinate } from './helper/fix';
function AxisTicksBuilder (scale, opt) {

  let ticks = [];
  if (scale.bandwidth != null) {
    // 当前比例尺为scaleBand
    ticks = scale.domain().map(d => ({
      pos: scale(d) + scale.bandwidth() / 2,
      value: d
    }));
    ticks.push({
      pos: scale.range()[0],
      value: ''
    });
    ticks.push({
      pos: scale.range()[1],
      value: ''
    });
  } else {
    ticks = scale.ticks(opt.ticks);
    let values = ticks.map(scale.tickFormat(opt.tickFormat));
    ticks = scale.ticks(opt.ticks).map((d, i) => ({
      pos: scale(d),
      value: values[i]
    }));
  };
  let g = new zrender.Group();
  switch (opt.orient) {
    case 'bottom': {
      ticks.forEach(tick => {
        g.add(new zrender.Line({
          shape: { x1: tick.pos + 0.5, y1: 0, x2: tick.pos + 0.5, y2: opt.tickSize || 5 },
          style: { stroke: '#fff' }
        }));
        g.add(new zrender.Text({
          style: { textFill: opt.textFill || '#000', textAlign: 'center', text: tick.value },
          position: [tick.pos, 8]
        }))
      });
      break;
    }
    case 'left': {
      ticks.forEach(tick => {
        g.add(new zrender.Line({
          shape: { x1: 0, y1: tick.pos + 0.5, x2: opt.tickSize || -5, y2: tick.pos + 0.5 },
          style: { stroke: opt.stroke || '#000' }
        }));
        g.add(new zrender.Text({
          style: { textFill: opt.textFill || '#000', textAlign: 'right', text: tick.value, textVerticalAlign: 'middle' },
          position: [-8, tick.pos]
        }));

      });
      let name = new zrender.Text({
        style: { textFill: opt.textFill || '#000', textAlign: 'center', text: opt.name, fontSize: 20 },
        draggable: true
      });
      let position = [...name.position];
      name.on('dragstart', function () {
        let position = [...this.position];
        this.on('drag', function () {
          this.attr('position', position);
        })
      })
      if (opt.position === 'top') {
        name.attr('position', [0, -30])
        g.add(name);
      }
      break;
    }
  }

  return g;

}

export function AxisBuilder (scale, opt, group, context) {
  // 负责生成比例尺的刻度线位置
  let g = AxisTicksBuilder(scale, opt);
  group.removeAll();
  switch (opt.orient) {
    case 'bottom': {
      group.add(new zrender.Line({
        shape: { x1: 0, y1: 0, x2: opt.cW, y2: 0 },
        style: { stroke: opt.stroke || '#000' }
      }));
      group.add(g);
      break;
    }
    case 'left': {
      group.add(new zrender.Line({
        shape: { x1: 0, y1: 0, x2: 0, y2: opt.cH },
        style: { stroke: opt.stroke || '#000' }
      }));
      group.add(g);
      group.on('dragstart', function (ev) {
        let pos1 = this.position[1];
        this.on('drag', function (ev) {
          let offsetX = fixCoordinate(ev, opt)[0];
          this.attr('position', [offsetX + 0.5, pos1])
        });
        this.on('dragend', function (ev) {
          let offsetX = fixCoordinate(ev, opt)[0];
          context.reorder({ pos: offsetX, value: opt.name });
        })
      })
      break;
    }
  }
}
