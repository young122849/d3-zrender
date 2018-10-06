export function fixCoordinate(ev: any, opt: any) {
  return [ev.offsetX - opt.margin.left, ev.offsetY - opt.margin.top];
}