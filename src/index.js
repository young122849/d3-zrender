import Chart from './utils/d3-zrender/index2';

let chart = new Chart('#canvas');
// d3.csv('/static/data/data2.csv', function (d) {
//   for (let key of Object.keys(d)) {
//     d[key] = +d[key]
//   };
//   return d;
// }).then(val => {
//   chart.updateData(val);
// })
d3.csv('/static/data/result.csv', function (d) {
  for (let key of Object.keys(d)) {
    if (key !== 'city' && key !== 'rating' && key !== 'date') {
      d[key] = +d[key]
    }
  }
  return d;
}).then(val => {
  chart.updateData(val);
})