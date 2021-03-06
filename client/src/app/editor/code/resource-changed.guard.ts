import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";

import { ResourceReferencesService } from "../../shared/resource-references.service";

import { CurrentCodeResourceService } from "../current-coderesource.service";

import { ProjectService } from "../project.service";

/**
 * Listens to changes of the resource ID in the URL and then propagates
 * the change to the appropriate service.
 */
@Injectable()
export class ResourceChangedGuard implements CanActivate {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _projectService: ProjectService,
    private _resourceReferences: ResourceReferencesService,
    private _router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ) {
    const resourceId = route.params["resourceId"];
    console.log(`ResourceChangedGuard: "${resourceId} => ???"`);

    const activatedResource =
      this._projectService.cachedProject.getCodeResourceById(resourceId);

    if (activatedResource) {
      // Ensure that the relevant block language is fully loaded
      const blockLanguageId = activatedResource.blockLanguageIdPeek;
      const toReturn = await this._resourceReferences.ensureResources({
        type: "blockLanguageGrammar",
        id: blockLanguageId,
      });
      console.log(
        "ResourceChangedGuard.canActivate resolved:",
        { type: "blockLanguageGrammar", id: blockLanguageId },
        " => ",
        toReturn
      );

      this._currentCodeResource._changeCurrentResource(activatedResource);

      console.log(
        `ResourceChangedGuard: "${resourceId}" => "${activatedResource.name}"`
      );
      return toReturn;
    } else {
      // May not use the `route` parameter, must use injected `ActivatedRoute` (which is the
      // state *before* navigation happens so it doesn't help here at all).
      // Maybe this will change? https://github.com/angular/angular/issues/22763#issuecomment-591059428
      // return (this._router.createUrlTree(["/../unknown"], { relativeTo: route }));

      // Meanwhile: Replace last "block" url segment with "unknown"
      console.log(`ResourceChangedGuard: "${resourceId} => unknown"`);
      return this._router.parseUrl(_state.url.replace(/block$/, "unknown"));
    }
  }
}
