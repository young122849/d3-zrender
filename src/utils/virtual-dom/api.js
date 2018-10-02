let api = {};
api.parentNode = function (childNode) {
  return childNode.parentNode;
}
api.removeChild = function (parentNode, childNode) {
  parentNode.removeChild(childNode);
}
api.createComment = function (text) {
  return document.createComment(text);
}
api.createText = function (text) {
  return document.createTextNode(text);
}
api.createElement = function (tagName) {
  return document.createElement(tagName);
}
api.appendChild = function (parentNode, childNode) {
  parentNode.appendChild(childNode);
}
api.insertBefore = function (parentNode, insertNode, before) {
  parentNode.insertBefore(insertNode, before);
}
api.tagName = function (node) {
  return node.tagName;
}
api.setTextContent = function (elm, text) {
  elm.textContent = text;
}
export default api;