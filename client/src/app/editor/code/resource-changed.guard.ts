import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { ResourceReferencesService } from '../../shared/resource-references.service';

import { CurrentCodeResourceService } from '../current-coderesource.service'

/**
 * Listens to changes of the resource ID in the URL and then propagates
 * the change to the appropriate service.
 */
@Injectable()
export class ResourceChangedGuard implements CanActivate {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _resourceReferences: ResourceReferencesService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    const resourceId = route.params["resourceId"];
    this._currentCodeResource._changeCurrentResource(resourceId);

    const activatedResource = this._currentCodeResource.peekResource;
    const blockLanguageId = activatedResource.blockLanguageIdPeek;

    return (this._resourceReferences.ensureResources(
      { type: "blockLanguageGrammar", id: blockLanguageId }
    ));
  }
}
