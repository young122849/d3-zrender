function updateData (context) {
  let data = [{ id: 1, x: 'A', y: '1' }, { id: 2, x: 'B', y: '2' }, { id: 3, x: 'C', y: '3' }, { id: 4, x: 'D', y: '4' }, { id: 5, x: 'E', y: '5' }];
  context.update = _update;
  context.update(data);
}
function _update (data) {
  if (data != null) {
    this.dataLoader = data;
  }
}
let dataLoaderModule = { init: updateData }
export { dataLoaderModule }