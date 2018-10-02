import is from './is';
import vnode from './vnode';
function h (a, b, c) {
  let text = undefined, children = undefined, data = undefined;
  if (c != null) {
    if (is.isPlainObject(b)) {
      data = b;
    }
    if (is.isPrimitive(c)) {
      text = c;
    } else if (is.isArray(c)) {
      children = c;
    } else if (c.sel) {
      children = [c];
    }
  } else if (b != null) {
    if (is.isArray(b)) {
      children = b;
    } else if (is.isPrimitive(b)) {
      text = b;
    } else if (b.sel) {
      children = [b];
    } else {
      data = b;
    }
  }
  if (children) {
    for (let i = 0, j = children.length; i < j; ++i) {
      let child = children[i];
      if (is.isPrimitive(child)) {
        children[i] = vnode(undefined, undefined, undefined, child, undefined);
      }
    }
  }
  return vnode(a, data, children, text, undefined);
}
export default h;