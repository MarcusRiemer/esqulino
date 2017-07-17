import { Injectable } from '@angular/core'
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router'

import { FlashService } from '../../shared/flash.service'

import { ProjectService, Project } from '../project.service'

/**
 * Ensures there is a page at the target of the navigation.
 */
@Injectable()
export class PageExistsGuard implements CanActivate {
  /**
   * Requires an instance of the current project.
   */
  constructor(private _projectService: ProjectService,
    private _router: Router,
    private _flashService: FlashService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const pageId = route.params['pageId'];
    let projectId: string = undefined;

    console.log(`PageExistsGuard: "${pageId}" => ???`);

    const toReturn = this._projectService.activeProject
      .first()
      .do((project) => projectId = project.id)
      .map(project => project.hasPageById(pageId))
      .do(res => {
        console.log(`PageExistsGuard: "${pageId}" => ${res}`)

        if (!res) {
          this._flashService.addMessage({
            caption: `Page with id "${pageId}" couldn't be loaded!`,
            text: `There is no page with this ID in the project.`,
            type: "danger"
          });

          this._router.navigate(["/editor", projectId]);
        }
      });

    return (toReturn);
  }
}
