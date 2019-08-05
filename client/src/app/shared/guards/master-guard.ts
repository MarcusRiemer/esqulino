import {Injectable, Injector} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from "@angular/router";

@Injectable()
export class MasterGuard implements CanActivate {

    constructor(private injector: Injector) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        let guards = route.data.guards || [];
        for (let guard of guards) {
            let instance: CanActivate = this.injector.get(guard);
            let result = await instance.canActivate(route, state);
            if (result === false || result instanceof UrlTree) {
                return result;
            }
        }
        return true;
    }

}