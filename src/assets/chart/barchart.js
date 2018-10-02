import { protoConfig } from './index'
class Barchart {
  constructor(opt) {
    this.config = Object.assign(protoConfig, opt)
    this.svg = d3.select(this.config.target)
    this.container = this.svg.append('g').attr('width', this.config.target.width)
      .attr('height', this.config.target.height)
      .attr('transform', `translate(${this.config.margin.left}, ${this.config.margin.top})`)
    this.worker = null
    this.x = d3.scaleBand().padding(0.08)
    this.y = d3.scaleLinear()
    this.color = d3.scaleOrdinal(d3.schemeBlues[4])
  }
  update () {
    // this.worker = new Worker('/static/worker.js')
    // this.worker.postMessage({ data: 'test' })
    this.process()

  }
  process () {
    function bumps (m) {
      var values = [], i, j, w, x, y, z;

      // Initialize with uniform random values in [0.1, 0.2).
      for (i = 0; i < m; ++i) {
        values[i] = 0.1 + 0.1 * Math.random();
      }

      // Add five random bumps.
      for (j = 0; j < 5; ++j) {
        x = 1 / (0.1 + Math.random());
        y = 2 * Math.random() - 0.5;
        z = 10 / (0.1 + Math.random());
        for (i = 0; i < m; i++) {
          w = (i / m - y) * z;
          values[i] += x * Math.exp(-w * w);
        }
      }

      // Ensure all values are positive.
      for (i = 0; i < m; ++i) {
        values[i] = Math.max(0, values[i]);
      }

      return values;
    }

    let xz = d3.range(58)
    let yz = d3.range(4).map(function (d) { return bumps(58) })
    let y01z = d3.stack().keys(d3.range(4))(d3.transpose(yz))
    let yMax = d3.max(yz, function (y) { return d3.max(y) })
    let y1Max = d3.max(y01z, function (y) { return d3.max(y, function (d) { return d[1] }) })
    this.data = {

    }
  }
}

export default Barchart