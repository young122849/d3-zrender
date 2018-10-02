export function throttle (delay, fn) {
  let last = 0;
  return function (ev) {
    let now = new Date();
    if (now.getTime() - last > delay) {
      fn.call(this, ev);
      last = now;
    }
  }
}

