let is = {};
is.isPrimitive = function (val) {
  return typeof val === 'number' || typeof val === 'string';
}
is.isArray = function (val) {
  return Object.prototype.toString.call(val) === '[object Array]';
}
is.isPlainObject = function (val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}
is.isDef = function (val) {
  return val != undefined;
}
is.isVnode = function (vnode) {
  return !!vnode.sel
}
is.isSameNode = function (oldVnode, vnode) {
  return oldVnode.sel === vnode.sel && oldVnode.key === vnode.key;
}
export default is;