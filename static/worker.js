importScripts('./render-queue.js');
self.onmessage = function (msg) {
  let canvas = msg.data.canvas;
  let rq = renderQueue(function () { console.log(123) });

}