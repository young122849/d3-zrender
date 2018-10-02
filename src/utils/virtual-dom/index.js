import api from './api';
import { rmdir } from 'fs';
import { listenerCount } from 'cluster';
// function init (modules, domApi) {
//   // 初始化全局生命周期钩子函数
//   let lifeCycles = {};
//   let hook = ['create', 'update', 'pre', 'post', 'destory', 'remove'];
//   for (let h of hook) {
//     lifeCycles[h] = [];
//     for (let module of modules) {
//       let moduleHook = module[h];
//       if (moduleHook) lifeCycles[h].push(moduleHook);
//     }
//   }
//   function createRemoveCb (childNode, listenersCount) {
//     return function cb () {
//       // 如果全局remove钩子函数与vnode自身remove钩子函数执行结束，正式将子DOM节点删除
//       if (--listenersCount === 0) {
//         let parentNode = api.parentNode(childNode);
//         api.removeChild(parentNode, childNode);
//       }
//     }
//   }
//   function createElm (vnode, insertedVnodeQueue) {
//     let h, data = vnode.data, sel = vnode.sel;
//     if (data != undefined) {
//       if (is.isDef(h = data.hook) && is.isDef(h = h.init)) {
//         h(vnode);
//         data = vnode.data;
//       }
//     }
//     let children = vnode.children, text = vnode.text, sel = vnode.sel
//     if (sel === '!') {
//       if (!is.isDef(text)) {
//         vnode.text = '';
//       }
//       vnode.elm = api.createComment(vnode.text);
//     } else if (sel === undefined) {
//       vnode.elm = api.createText(vnode.text);
//     } else {
//       let hashIndex = sel.indexOf('#');
//       let dotIndex = sel.indexOf('.');
//       let hash = hashIndex === -1 ? sel.length : hashIndex;
//       let dot = dotIndex === -1 ? sel.length : dotIndex;
//       let tagName = hashIndex !== -1 || dotIndex !== -1 ? sel.slice(0, Math.min(hashIndex, dotIndex)) : sel;
//       let elm = vnode.elm = api.createElement(tagName);
//       // 为elm添加id或className
//       if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot));
//       if (dotIndex > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));

//       // 此时可以执行全局create钩子函数，为vnode.elm添加样式等
//       for (let i = 0, j = lifeCycles.create.length; i < j; ++i) {
//         lifeCycles.create[i](vnode);
//       }
//       if (is.isDef(text)) {
//         api.appendChild(elm, api.createText(text));
//       } else if (is.isDef(children)) {
//         for (let child of children) {
//           if (child != null)
//             api.appendChild(elm, createElm(child, insertedVnodeQueue))
//         }
//       }
//       // 此时已经递归处理好subVnode
//       if (is.isDef(h = data) && is.isDef(h = h.hook)) {
//         if (h.create) h.create(vnode);
//         if (h.insert) insertedVnodeQueue.push(vnode);
//       }
//     }
//     return vnode.elm;
//   }

//   function addNodes (parentNode, before, vnodes, startIndex, endIndex, insertedVnodeQueue) {
//     for (; startIndex <= endIndex; ++startIndex) {
//       let child = vnodes[startIndex];
//       if (child != null)
//         api.insertBefore(parentNode, createElm(child, insertedVnodeQueue), before);
//     }
//   }

//   function removeNodes (parentNode, vnodes, startIndex, endIndex) {
//     for (; startIndex <= endIndex; ++startIndex) {
//       let child = vnodes[startIndex];
//       if (child) {
//         if (is.isDef(child.sel)) {
//           // 在删除之前，调用destory钩子函数
//           invokeDestoryHook(child)
//           // listenersCount 为全局remove钩子函数与默认vnode的remove钩子函数
//           listenersCount = lifeCycles.remove.length + 1;
//           rm = createRemoveCb(child, listenerCount);
//           for (let i = 0, j = lifeCycles.remove.length; i < j; ++i) lifeCycles.remove[i](child, rm)
//           if (is.isDef(h = child.data) && is.isDef(h = h.hook) && is.isDef(h = h.remove)) h(child, rm);
//           else rm();
//         } else {
//           // 直接删除文本节点
//           api.removeChild(parentNode, child.elm)
//         }
//       }
//     }
//   }

//   function invokeDestoryHook (vnode) {
//     let data = vnode.data;
//     let h;
//     if (data != undefined) {
//       if (is.isDef(h = data.hook) && is.isDef(h = h.destory)) h(vnode);
//       for (let i = 0, j = lifeCycles.destory.length; i < j; ++i) lifeCycles.destory[i](vnode);
//       let children = vnode.children;
//       if (children != null) {
//         for (let i = 0, j = children.length; i < j; ++i) {
//           let child = children[i];
//           if (child != null && typeof child !== 'string') {
//             invokeDestoryHook(child);
//           }
//         }
//       }
//     };
//   }

//   function emptyNodeAt (elm) {
//     let id = elm.id ? '#' + elm.id : '';
//     let className = elm.className ? '.' + elm.className.split(' ').join('.') : '';
//     return vnode(api.tagName(elm).toLowerCase() + id + className, {}, [], undefined, elm)
//   }

//   function patchVnode (oldVnode, vnode, insertedVnodeQueue) {
//     let h;
//     if (is.isDef(h = vnode.data) && is.isDef(h = h.hook) && is.isDef(h = h.prepatch))
//       h(oldVnode, vnode);
//     let elm = vnode.elm = oldVnode.elm;
//     let oldChildren = oldVnode.children, children = vnode.children;
//     if (oldVnode === vnode) return;
//     if (vnode.data != undefined) {
//       for (let i = 0, j = lifeCycles.update.length; i < j; ++i) lifeCycles.update[i](oldVnode, vnode);
//       h = vnode.data.hook;
//       if (is.isDef(h) && is.isDef(h = h.update)) h(oldVnode, vnode);
//     }
//     if (!is.isDef(vnode.text)) {
//       if (oldChildren && children) {

//       } else if (oldChildren) {

//       } else if (children) {
//         if (is.isDef(oldVnode.text)) api.setTextContent(elm, '');
//         addVnodes(elm, null, children, 0, children.length - 1, insertedVnodeQueue);
//       } else {

//       }
//     } else if (vnode.text !== oldVnode.text) {
//       // vnode仅包含一个文本节点，或vnode本身代表的就是一个文本节点
//       api.setTextContent(elm, vnode.text);
//     }
//   }

//   return function patch (oldVnode, vnode) {
//     let insertedVnodeQueue = [];
//     let elm;
//     // 调用全局pre钩子函数
//     for (let i = 0, j = lifeCycles.pre.length; i < j; ++i) lifeCycles.pre[i]();
//     if (!is.isVnode(oldVnode)) {
//       oldVnode = emptyNodeAt(oldVnode);
//     }
//     if (is.isSameNode(oldVnode, vnode)) {
//       // 值得比较
//       patchVnode(oldVnode, vnode, insertedVnodeQueue);
//     } else {
//       elm = oldVnode.elm;
//       parent = api.parentNode(elm);
//       createElm(vnode, insertedVnodeQueue);
//       if (parent != null) {
//         api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
//         removeNodes(parent, [oldVnode], 0, 0);
//       }
//     }

//     for (let i = 0, j = insertedVnodeQueue.length; i < j; ++i) {
//       let h = insertedVnodeQueue[i].data;
//       if (is.isDef(h) && is.isDef(h = h.hook) && is.isDef(h = h.insert))
//         h(insertedVnodeQueue[i]);
//     }
//     for (let i = 0, j = lifeCycles.post.length; i < j; ++i) lifeCycles.post[i]();
//     return vnode;
//   }
// }
function init (modules, domApi) {
  let cbs = {};
  let hooks = ['create', 'update', 'pre', 'post', 'destroy', 'remove'];
  for (let hook of hooks) {
    cbs[hook] = [];
    for (let module of modules) {
      let moduleHook = module[hook];
      if (moduleHook) cbs[hook].push(moduleHook);
    }
  }
  function addNodes (elm, before, vnodes, startIndex, endIndex, insertedVnodeQueue) {
    for (; startIndex <= endIndex; ++startIndex) {
      let vnode = vnodes[startIndex];
      if (vnode != null)
        api.insertBefore(elm, createElm(vnode, insertedVnodeQueue), before);
    }
  }
  function createRemovecb (elm, count) {
    return function () {
      if (--count === 0) {
        let parent = api.parentNode(elm);
        if (parent != null)
          api.removeChild(parent, elm);
      }
    }
  }
  function removeNodes (elm, vnodes, startIndex, endIndex) {
    let h;
    for (; startIndex <= endIndex; ++startIndex) {
      let vnode = vnodes[startIndex];
      if (vnode) {
        if (vnode.text != null) {
          // vnode不是一个纯文本节点
          // invokeDestroyHook()
          let rm = createRemovecb(elm, cbs.remove.length + 1);
          for (let cb of cbs.remove) {
            cb(vnode, rm);
          }
          if ((h = vnode.data) && (h = h.hook) && (h = h.remove)) {
            h(vnode, rm)
          } else {
            rm();
          }
        } else {
          // vnode是一个纯文本节点
          api.removeChild(elm, vnode.elm);
        }
      }
    }
  }
}