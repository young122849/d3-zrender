const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

function MyPromise (fn) {
  this._status = PENDING;
  this._value = null;
  this._error = null;
  this._fulfilledCallbacks = [];
  this._rejectedCallbacks = [];
  try {
    fn.call(this, this._resolve.bind(this), this._reject.bind(this));
  } catch (err) {
    this._reject(err);
  }
}
MyPromise.prototype._resolve = function (val) {
  let self = this;
  function run () {
    if (this._status !== PENDING) return;
    let fulfilledFn = function (value) {
      this._status = FULFILLED;
      this._value = value;
      let cb;
      while (cb = this._fulfilledCallbacks.shift()) {
        cb(value);
      }
    };
    let rejectedFn = function (error) {
      this._status = REJECTED;
      this._error = error;
      let cb;
      while (cb = this._rejectedCallbacks.shift()) {
        cb(error);
      }
    };
    if (val instanceof MyPromise) {
      val.then(function (val) {
        fulfilledFn.call(self, val);
      }, function (err) {
        rejectedFn.call(self, err);
      })
    } else {
      fulfilledFn.call(self, val);
    }
  }
  setTimeout(run.bind(this), 0);
}
MyPromise.prototype._reject = function (err) {
  let self = this;
  function run () {
    if (this._status !== PENDING) return;
    let rejectedFn = function (error) {
      this._error = error;
      this._status = REJECTED;
      let cb;
      while (cb = this._rejectedCallbacks.shift()) {
        cb(error);
      }
    };
    rejectedFn.call(self, err);
  }
  setTimeout(run.bind(this), 0);
}
MyPromise.prototype.then = function (onFulfilledFn, onRejectedFn) {
  let self = this;
  return new MyPromise(function (nextResolve, nextReject) {
    let fulfilledFn = function (val) {
      if (Object.prototype.toString.call(onFulfilledFn) !== '[object Function]')
        nextResolve(val);
      try {
        let res = onFulfilledFn(val);
        if (res instanceof MyPromise) {
          res.then(nextResolve, nextReject);
        } else {
          nextResolve(res);
        }
      } catch (err) {
        nextReject(err);
      }
    };
    let rejectedFn = function (err) {
      if (Object.prototype.toString.call(onRejectedFn) !== '[object Function]')
        nextReject(err);
      try {
        let res = onRejectedFn(err);
        if (res instanceof MyPromise) {
          res.then(nextResolve, nextReject);
        } else {
          nextResolve(res);
        }
      } catch (error) {
        nextReject(error);
      }
    };
    switch (this._status) {
      case PENDING:
        this._fulfilledCallbacks.push(fulfilledFn);
        this._rejectedCallbacks.push(rejectedFn);
        break;
      case FULFILLED:
        fulfilledFn(this._value);
        break;
      case REJECTED:
        rejectedFn(this._value);
    }
  }.bind(self));
}
MyPromise.resolve = function (thenable) {
  if (thenable instanceof MyPromise) {
    return thenable
  }
  return new MyPromise(function (resolve, reject) { resolve(thenable) })
}
MyPromise.reject = function (p) {
  if (p instanceof MyPromise)
    return p;
  return new MyPromise(function (resolve, reject) {
    reject(p)
  });
}
MyPromise.prototype.catch = function (onRejectedFn) {
  this.then(undefined, onRejectedFn);
}
MyPromise.all = function (lists) {
  let values = [];
  return new MyPromise(function (resolve, reject) {
    for (let i = 0, j = lists.length; i < j; ++i) {
      lists[i].then(function (val) {
        values.push(val);
        if (values.length === lists.length) {
          resolve(values);
        }
      }, function (err) {
        reject(err);
      })
    }
  });
}
MyPromise.race = function (lists) {
  return new MyPromise(function (resolve, reject) {
    for (let i = 0, j = lists.length; i < j; ++i) {
      lists[i].then(function (val) {
        resolve(val);
      }, function (err) {
        reject(err);
      })
    }
  });
}
export default MyPromise