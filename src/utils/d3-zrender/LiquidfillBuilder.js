import zrender from 'zrender';
export function drawSineWave (data, opt) {
  let points = [];
  let offset = opt.offset = opt.offset + opt.speed;
  let [originX, endX] = [opt.padding + opt.lineWidth, opt.width - opt.padding - opt.lineWidth];
  points = [];
  let dy = opt.width * (1 - opt.percent);
  opt.percent += 0.01;
  if (opt.percent >= data) {
    opt.percent = data;
  }
  for (let x = 0; x <= endX - originX; x = x + 0.5) {
    let y = -Math.sin(x * opt.waveWidth + offset);
    y = dy + y * opt.waveHeight;
    points.push([x + originX, y]);
  }
  // 封闭路径
  points.push([endX, opt.height - opt.padding - opt.lineWidth]);
  points.push([originX, opt.height - opt.padding - opt.lineWidth]);
  points.push([...points[0]]);
  return points;
}

export function LiquidfillBuilder (data, opt, parentGroup) {
  opt = { ...opt, percent: 0.05, speed: 0.05, offset: 10, waveHeight: 20, waveWidth: 0.02, width: 600, height: 600, padding: 25, lineWidth: 5 };
  let origin = [opt.width / 2, opt.width / 2];
  let radius = (opt.width - 2 * (opt.padding + opt.lineWidth)) / 2;
  let backGroundText = new zrender.Text({
    style: { text: data[0] * 100 + '%', textFill: '#000', fontSize: 40, textAlign: 'center', textVerticalAlign: 'middle' },
    position: [opt.width / 2, opt.height / 2]
  });
  let text = new zrender.Text({
    style: { text: data[0] * 100 + '%', textFill: '#fff', fontSize: 40, textAlign: 'center', textVerticalAlign: 'middle' },
    position: [opt.width / 2, opt.height / 2]
  });

  let clipCircle = new zrender.Circle({
    shape: { cx: origin[0], cy: origin[1], r: radius },
    style: { lineWidth: opt.lineWidth, stroke: '#156ACF', fill: 'rgba(231,248,255,1)' }
  });
  let percent = data[0];
  let currentPercent = 0.05;
  let points = null;
  let polyline = new zrender.Polyline({
    style: { stroke: 'transparent', fill: 'rgb(53,91,163)' }
  });
  polyline.attr('position', [-opt.width / 2, -opt.height / 2])
  text.setClipPath(polyline);
  polyline.setClipPath(clipCircle);
  let render = function () {
    points = drawSineWave(currentPercent, opt);
    polyline.attr('shape', { points: points });
    currentPercent = currentPercent + 0.05
    if (currentPercent >= percent) {
      currentPercent = percent;
    }
    points = [];
    window.requestAnimationFrame(render);
  };
  render();

  parentGroup.add(clipCircle);
  parentGroup.add(backGroundText);

  parentGroup.add(polyline);

  parentGroup.add(text);
}