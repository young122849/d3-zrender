// import * as d3 from 'd3';
// import './utils/load-svg'
import zrender from 'zrender';
// // import Chart from './utils/d3-zrender/index2';
// // let chart = new Chart('#canvas')
// // d3.csv('/static/data/result.csv', function (d) {
// //   for (let key of Object.keys(d)) {
// //     if (key !== 'rating' && key !== 'city') {
// //       d[key] = +d[key];
// //     }
// //   }
// //   return d;
// // }).then(function (val) {
// //   chart.updateData(val);
// // })
// // let dom = document.querySelector('#btn');
// // dom.addEventListener('click', function () {
// //   console.log(123);
// //   //
// //   chart.shuffle(["AQI", "PM2.5", "date", "PM10", "CO", "NO2", "SO2", "rating"])
// //   // chart.shuffle(["date", "AQI", "PM2.5", "PM10", "CO", "NO2", "SO2", "rating"]);
// // })
let zr = zrender.init(document.querySelector('#canvas'));
// let g = new zrender.Group();
// g.attr('position', [0.5, 0.5]);
// let boundingRect = new zrender.Rect({
//   shape: { width: 550, height: 550 },
//   style: { stroke: 'transparent', fill: 'rgba(231,248,255,1)' }
// });
// let realPercent = 0.5;
// let sX = 25;
// let lineWidth = 5;
// let sector = new zrender.Arc({
//   shape: { cx: 275, cy: 275, r: 275 - lineWidth - sX },
//   style: {
//     stroke: '#156ACF', fill: 'rgba(231,248,255,1)',
//     lineWidth: lineWidth,
//   },
// });

// // boundingRect.setClipPath(sector)
// let waveHeight = 20;
// let waveWidth = 0.05;
// let percent = 0.05;
// let drawSine = function (offset) {
//   let points = [];
//   for (let x = 0; x <= 550 - 2 * (lineWidth + sX); x = x + 0.5) {
//     let y = -1 * Math.sin(x * waveWidth + offset);
//     let dy = 250 * 2 * (1 - percent);
//     points.push([x + sX + lineWidth, dy + y * waveHeight]);
//   }
//   if (percent < realPercent) {
//     percent = percent + 0.01
//   }
//   points.push([550 - sX - 5, 550 - sX]);
//   points.push([sX + 5, 550 - sX]);
//   points.push(points[0]);
//   return points;
// }

// let speed = 0.01;
// let result = drawSine(0);
// let polyline = new zrender.Polyline({
//   style: { stroke: 'transparent', fill: 'rgb(53,91,163)' },
//   position: [-275, -275]
// })
// let line = new zrender.Line({
//   shape: { x1: 0, y1: 275, x2: 550, y2: 275 },
//   style: { stroke: '#fff' }
// });
// let text = new zrender.Text({
//   style: {
//     text: realPercent * 100 + "%", textFill: '#fff', fontSize: 40,
//     textAlign: 'center',
//     textVerticalAlign: 'middle',

//   },
//   position: [275, 275]
// });
// let bText = new zrender.Text({
//   style: {
//     text: realPercent * 100 + "%", textFill: '#000', fontSize: 40,
//     textAlign: 'center',
//     textVerticalAlign: 'middle',

//   },
//   position: [275, 275]
// });
// text.setClipPath(polyline)
// let offset = 5;
// let newOffset = offset;
// function render () {
//   newOffset = newOffset + offset * speed;
//   let points = drawSine(newOffset);
//   polyline.attr('shape', { points });
//   window.requestAnimationFrame(render);
// }
// render();
// polyline.setClipPath(sector);

// g.add(boundingRect);
// g.add(sector);
// g.add(bText)
// g.add(polyline);
// g.add(text);
// // g.add(line);
// zr.add(g);
import { LiquidfillBuilder } from './utils/d3-zrender/LiquidfillBuilder';
let g = new zrender.Group();
g.attr('name', 'liquidfill');
zr.add(g);
LiquidfillBuilder([0.5], {}, g);
console.log(g);
