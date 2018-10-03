import * as d3 from 'd3';
import './utils/load-svg'
import IntervalChart from './utils/d3-zrender/interval';
let chart = new IntervalChart('#canvas');
d3.csv('/static/data/economic.csv', function (d) {
  for (let key of Object.keys(d)) {
    if (key !== 'province' && key !== 'industry') {
      d[key] = +d[key]
    }
  }
  return d;
}).then(val => {
  chart.updateData(val);
});
let year = 2003;
let btn = document.getElementById('btn');
btn.addEventListener('click', function () {
  chart.update(year++);
})
// setInterval(function () {
//   if (year === 2011) {
//     year = 2002;
//   }
//   year++;
//   chart.update(year);
// }, 1000);
