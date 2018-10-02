function vnode (sel, data, children, text, elm) {
  return {
    sel, data, children, text, elm, key: !data ? undefined : data.key
  }
}
export default vnode;