function applyDestoryStyle (vnode) {
  let s = (vnode && vnode.data || {}).style;
  // 不存在destroy样式，直接返回
  if (!s || !s.destory) return;
  let elm = vnode.elm;
  for (let key of Object.keys(s.destory)) {
    elm.style[key] = s.destory[key];
  }
}

function applyRemoveStyle (vnode, rmCallback) {
  let r = (vnode && vnode.data || {}).style;
  if (!r || !(r = r.remove)) {
    rmCallback();
    return;
  }

}