import { protoConfig } from './index'

class ParallelCoordinate {
  constructor(opt) {
    this.opt = Object.assign(protoConfig, opt)
    this.container = d3.select(this.opt.target)
    this.canvas = this.container.append('canvas')
    this.progress = this.container.append('div').attr('class', 'progress')
    this.context = this.canvas.node().getContext('2d')
    this.worker = new Worker('/static/worker.js')
    this.xScale = d3.scalePoint()
    this.yScales = {}
    this.line = d3.line().x(function (d) {
      return d[0]
    }).y(function (d) { return d[1] }).context(this.context)
  }
  update (_data) {
    this.data = this.data || _data
    if (this.data == null)
      return
    let self = this
    this.width = this.container.node().clientWidth
    this.height = this.container.node().clientHeight
    this.canvas.attr('width', this.width).attr('height', this.height)
    this.xScale.rangeRound([0, this.width]).domain(d3.keys(this.data[0]).filter(function (d) {
      return d !== 'name' && (self.yScales[d] = d3.scaleLinear().domain(d3.extent(self.data, function (p) { return +p[d] })).range([self.height, 0]))
    }))
    let processed = []
    this.data.forEach(function (d) {
      let temp = []
      d3.keys(self.yScales).forEach(function (scale) {
        d[scale] = [self.xScale(scale), self.yScales[scale](+d[scale])]
        temp.push(d[scale])
      })
      processed.push(temp)
    })
    this.renderQueue(this.draw).rate(10)(processed)
  }
  draw (chunk) {
    this.context.beginPath()
    this.context.lineWidth = 1.5
    chunk.forEach(c => this.line(c))
    this.context.strokeStyle = 'steelblue'
    this.context.stroke()
  }
  renderQueue (draw) {
    let queue = []
    let length = 0
    let self = this
    let rate = 1000
    let rq = function (_data) {
      if (_data != null) {
        rq.data(_data)
      }
      rq.render()
    }
    rq.data = function (val) {
      queue = val.slice(0)
      length = queue.length
    }
    rq.render = function () {
      let valid = true
      rq.stop = function () {
        valid = false
      }
      let t = d3.timer(function () {
        if (valid == false || queue.length == 0) {
          t.stop()
        }
        let chunk = queue.splice(0, rate)
        self.progress.attr('width', Math.round((1 - queue.length / length) * 100) + '%')
        draw.call(self, chunk)
      })
    }
    rq.rate = function (_rate) {
      if (_rate != null) {
        rate = _rate
        return rq
      } else {
        return rate
      }
    }
    return rq
  }
}

export default ParallelCoordinate