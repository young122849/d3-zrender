import ParallelCoordinate from './utils/d3-zrender/parallel-coordinate';
let chart = new ParallelCoordinate('#canvas');
d3.csv('/static/data/weather.csv', d => {
  for (let key of Object.keys(d)) {
    if (key !== 'rating') {
      d[key] = +d[key];
    }
  }
  return d;
}).then(val => {
  chart.updateData(val);
})