export function throttle(delay: number, fn: any) {
  let start: number = 0;
  return function (...args) {
    let now: Date = new Date();
    if (now.getTime() - start > delay) {
      fn.apply(this, args);
      start = now.getTime();
    }
  }
}