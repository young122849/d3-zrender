let renderQueue = (function (fn, context) {
  let _queue = [];
  let _rate = 10;
  let _stop = function () { };
  let _clear = function () { };
  let rq = function (value) {
    if (value != null && Object.prototype.toString.call(value) === '[object Array]') {
      rq.data(value);
    }
    rq.stop();
    rq.clear();
    rq.render();
  };
  rq.rate = function (value) {
    if (value != null) {
      _rate = value;
    } else {
      return _rate;
    }
  }
  rq.render = function () {
    let valid = true;
    rq.stop = function () {
      valid = false;
    }
    function doFrame () {
      if (!valid) {
        return;
      }
      let chunk = _queue.splice(0, _rate);
      fn.call(context, chunk);
      self.requestAnimationFrame(doFrame);
    }
    doFrame();
  }
  rq.data = function (arr) {
    rq.stop();
    _queue = arr.slice(0);
  }
  rq.stop = _stop;
  rq.clear = function (fn) {
    if (fn != null) {
      _clear = fn;
    } else {
      _clear();
    }
  }
  return rq;
})