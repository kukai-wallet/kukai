import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomReusingStrategy implements RouteReuseStrategy {
  private cache: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig.data && route.routeConfig.data.reuse;
  }
  store(route: ActivatedRouteSnapshot, handler: DetachedRouteHandle): void {
    if (handler) {
      this.cache[this.getUrl(route)] = handler;
    }
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.cache[this.getUrl(route)];
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig || route.routeConfig.loadChildren) {
      return null;
    }
    return this.cache[this.getUrl(route)];
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    return false;
  }
  getUrl(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig) {
      return route.routeConfig.path;
    }
  }
}
