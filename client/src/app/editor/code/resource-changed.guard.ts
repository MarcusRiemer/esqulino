import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { ResourceReferencesService } from '../../shared/resource-references.service'

import { CurrentCodeResourceService } from '../current-coderesource.service'

import { SidebarService } from '../sidebar.service';
import { CodeSidebarComponent } from './code.sidebar';

/**
 * Listens to changes of the resource ID in the URL and then propagates
 * the change to the appropriate service.
 */
@Injectable()
export class ResourceChangedGuard implements CanActivate {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _resourceReferences: ResourceReferencesService,
    private _sidebarService: SidebarService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    const resourceId = route.params["resourceId"];
    this._currentCodeResource._changeCurrentResource(resourceId);

    // From here on the resource is activated
    const activatedResource = this._currentCodeResource.peekResource;

    // Ensure that all previous sidebars are hidden
    this._sidebarService.showSingleSidebar(CodeSidebarComponent.SIDEBAR_IDENTIFIER, activatedResource);

    // Ensure that the relevant block language is fully loaded
    const blockLanguageId = activatedResource.blockLanguageIdPeek;
    return (this._resourceReferences.ensureResources(
      { type: "blockLanguageGrammar", id: blockLanguageId }
    ));
  }
}
