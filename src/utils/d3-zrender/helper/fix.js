export function fixCoordinate (ev, opt) {
  return [ev.offsetX - opt.margin.left, ev.offsetY - opt.margin.top];
}