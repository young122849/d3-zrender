import { throttle } from '../optimize/index'
export function TooltipBuilder (context, delay) {
  delay = delay || 100;
  let tooltip = document.createElement('div')
  tooltip.style = `position: absolute; display: none; border-style: solid; white-space: nowrap; z-index: 9999999; transition: left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s; background-color: rgba(50, 50, 50, 0.7); border-width: 0px; border-color: rgb(51, 51, 51); border-radius: 4px; color: rgb(255, 255, 255); font: 14px/21px sans-serif; padding: 5px; left: 266px; top: 201px; pointer-events: none;`
  context._zr.dom.appendChild(tooltip);
  context._tooltip = tooltip;
  function updateTooltip (ev) {
    if (this.toolTipData == null || this.toolTipData.length == 0) {
      return;
    }
    // 转换至正确坐标
    let [left, top] = [this._opt.margin.left, this._opt.margin.top]
    let [offsetX, offsetY] = [ev.offsetX - left, ev.offsetY - top];
    let [width, height] = [this._opt.cWidth, this._opt.cHeight];
    let [offsetLeft, offsetTop] = [ev.offsetX + 10, ev.offsetY - 30];
    if (offsetX > 0 && offsetX < width && offsetY > 0 && offsetY < height) {
      let [offsetWidth, offsetHeight] = [this._tooltip.offsetWidth, this._tooltip.offsetHeight]
      this._tooltip.style.display = 'block';
      let toolTipText = `${this.toolTipData[0].name}<br>`;
      this.toolTipData.slice(1).reverse().forEach(function (d) {
        toolTipText += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${d.fill};"></span>${d.name}:${d.value}<br>`
      });
      // 保证tooltip在规定范围内
      if (offsetWidth + offsetLeft > width) {
        offsetLeft = offsetX - 10 - offsetWidth;
      }
      if (offsetHeight + offsetY > height) {
        offsetTop = height + top - offsetHeight;
      }
      this._tooltip.style.left = offsetLeft + 'px';
      this._tooltip.style.top = offsetTop + 'px';
      this._tooltip.innerHTML = toolTipText;
    } else {
      this._tooltip.style.display = 'none';
      return;
    }
  };
  function destroyTooltip () {
    context._tooltip.style.display = 'none';
  }
  function destroyPointer () {
    // 奇怪的方式
    context._verticalPointerGroup.removeAll();
    context._horizontalPointerGroup.removeAll();
    context._crossPointerGroup.removeAll();

    context._zr.refresh();
  }
  // console.log(context);
  context._zr.dom.addEventListener('mouseout', function (ev) {

    destroyTooltip();
    destroyPointer();
  });

  context._zr.on('mousemove', throttle(delay, updateTooltip), context);
}
