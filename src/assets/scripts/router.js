class Router {
  constructor(mode, routes) {
    this.mode = mode || 'hash'
    this.routes = routes || []
  }
}