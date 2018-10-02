function EventEmitter () {
  this._events = Object.create(null);
}
EventEmitter.prototype.on = function (type, fn, flag) {
  if (this._events[type] == null) {
    this._events[type] = [];
  }
  if (Object.prototype.toString.call(fn) !== '[object Function]') {
    console.error('Second Parameter must be a function!')
    return;
  }
  let index = this._events[type].indexOf(fn);
  if (index === -1) {
    if (flag === false) {
      this._events[type].push(fn);
    }
    else {
      this._events[type].unshift(fn);
    }
    if (this._events[type].length > this.getMaxListeners()) {
      console.log('Warning!')
    }
  }
}
EventEmitter.prototype.prepend = function (type, fn) {
  this.on(type, fn, true);
}
EventEmitter.prototype.once = function (type, fn, flag) {
  let self = this;
  let wrap = function () {
    let args = Array.prototype.slice.call(arguments, 0);
    fn.apply(self, args);
    self.removeListener(type, wrap);
  }
  wrap.realCallback = fn;
  this.on(type, wrap, flag);
}
EventEmitter.prototype.oncePrepend = function (type, fn) {
  this.once(type, fn, true);
}
EventEmitter.prototype.removeListener = function (type, fn) {
  if (this._events[type] == null) {
    return;
  }
  if (Object.prototype.toString.call(fn) !== '[object Function]') {
    console.error('Second Parameter must be a function!')
    return;
  }
  for (let i = 0, j = this._events[type].length; i < j; ++i) {
    if (this._events[type][i] === fn || this._events[type][i].realCallback === fn) {
      this._events[type].splice(i, 1);
    }
  }
}
EventEmitter.prototype.emit = function (type, msg) {
  let self = this;
  if (this._events[type] == null || this._events[type].length === 0) {
    return;
  }
  this._events[type].forEach(function (fn) {
    fn.call(self, msg);
  })
}
EventEmitter.prototype.setMaxListeners = function (value) {
  value = +value;
  if (typeof value === 'number' && value === value) {
    this.maxListeners = value;
  } else {
    console.error('Value must be a number!');
    return;
  }
}
EventEmitter.prototype.getMaxListeners = function () {
  return this.maxListeners || EventEmitter.defaultListeners;
}
EventEmitter.defaultListeners = 10;

export { EventEmitter }