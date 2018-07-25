import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { CurrentCodeResourceService } from '../current-coderesource.service'

/**
 * Listens to changes of the resource ID in the URL and then propagates
 * the change to the appropriate service.
 */
@Injectable()
export class ResourceChangedGuard implements CanActivate {
  constructor(private _editorService: CurrentCodeResourceService) {
  }

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    const resourceId = route.params["resourceId"];
    this._editorService.currentResourceChanged(resourceId);
    return (true);
  }
}
