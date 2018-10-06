declare var zrender: any;

interface LiquidfillOption {
  length: number;
  offset?: number;
  speed?: number;
  padding?: number;
  percent?: number; // 用于保存当前百分比
  lineWidth?: number;
  waveHeight?: number;
  waveWidth?: number;
}

const defaultLiquidfillOption: LiquidfillOption = {
  length: 0,
  waveHeight: 20,
  waveWidth: 0.02,
  percent: 0.01,
  speed: 0.05,
  padding: 25,
  lineWidth: 5,
  offset: 10
}

export function drawSineWave(data: number, opt: LiquidfillOption) {
  let points: null | number[][] = [];
  let offset: number = opt.offset = opt.offset + opt.speed;
  // 确定水球图的起始X坐标值与终点X坐标值
  let [originX, endX] = [opt.padding, opt.length - opt.padding];

  let height = opt.length - 2 * opt.padding;

  // 确定sin曲线的基准位置
  let dy = height * (1 - opt.percent) + opt.padding;

  // 逐渐增加百分比值起到动画效果,并在达到目标百分比后保持不变
  if (opt.percent < data) {
    opt.percent += 0.01;
  }

  // 用于保存sin曲线的各点坐标
  for (let x = 0; x <= endX - originX; x = x + 0.5) {
    // 因为canvas画布坐标原点位于左上角,因此需要对Math.sin求值结果取负
    let y = -Math.sin(x * opt.waveWidth + offset);
    // 改变sin曲线的振幅
    y = dy + y * opt.waveHeight;
    points.push([x + originX, y]);
  }
  // 封闭路径
  points.push([endX, opt.length - opt.padding]);
  points.push([originX, opt.length - opt.padding]);
  points.push([...points[0]]);
  return points;
}

export function LiquidfillBuilder(data: number[], opt: LiquidfillOption, group: any) {
  // 合并配置项
  opt = { ...defaultLiquidfillOption, ...opt };
  // 获取圆心坐标
  let origin = [opt.length / 2, opt.length / 2];
  // 获取水球半径
  let radius = (opt.length - 2 * (opt.padding + opt.lineWidth)) / 2;
  // 设置背景文字
  let backGroundText = new zrender.Text({
    style: { text: data[0] * 100 + '%', textFill: '#000', fontSize: 40, textAlign: 'center', textVerticalAlign: 'middle' },
    position: [...origin],
    name: 'background-text'
  });
  let text = new zrender.Text({
    style: { text: data[0] * 100 + '%', textFill: '#fff', fontSize: 40, textAlign: 'center', textVerticalAlign: 'middle' },
    position: [...origin],
    name: 'foreground-text'
  });

  let clipCircle = new zrender.Circle({
    shape: { cx: origin[0], cy: origin[1], r: radius },
    style: { lineWidth: opt.lineWidth, stroke: '#156ACF', fill: 'rgba(231,248,255,1)' },
    name: 'clip-circle'
  });
  let percent = data[0];

  let polyline = new zrender.Polyline({
    style: { stroke: 'transparent', fill: '#355ba3' },
    // style: { stroke: 'transparent', fill: '#179dea' },
    // style: { stroke: 'transparent', fill: '#1773cf' },
    name: 'sine-wave',
    position: [-origin[0], -origin[1]]
  });

  text.setClipPath(polyline);
  polyline.setClipPath(clipCircle);

  let render = function () {
    let points = drawSineWave(percent, opt);
    polyline.attr('shape', { points: points });
    // 避免内存泄漏
    points = [];
    window.requestAnimationFrame(render);
  };
  render();
  group.add(clipCircle);
  group.add(backGroundText);
  group.add(polyline);
  group.add(text);
}