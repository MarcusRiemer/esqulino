import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { ProjectService, Project } from '../project.service'

import { TreeEditorService } from '../editor.service'


@Injectable()
export class ResourceChangedGuard implements CanActivate {
  constructor(private _editorService: TreeEditorService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const resourceId = route.params["resourceId"];
    this._editorService.currentResourceChanged(resourceId);
    return (true);
  }
}
