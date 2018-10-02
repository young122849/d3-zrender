function MySet () {
  this.values = [];
}
MySet.prototype.has = function (val) {
  for (var i = 0, j = this.values.length; i < j; ++i) {
    if (this.values[i] === val) {
      if (this.values[i] === 0 && 1 / this.values[i] !== 1 / val) {
        return false;
      }
      return true;
    } else {
      if (this.values[i] !== this.values[i] && val !== val) {
        return true;
      }
    }
  }
  return false;
}
MySet.prototype.add = function (val) {
  if (!this.has(val)) {
    this.values.push(val);
    return false;
  }
  return true;
}
MySet.prototype.delete = function (val) {
  if (this.has(val)) {

  }
}
export { MySet }