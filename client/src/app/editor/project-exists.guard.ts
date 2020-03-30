import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { of } from "rxjs";
import { catchError, first, map, tap } from "rxjs/operators";

import { FlashService } from "../shared/flash.service";

import { ProjectService } from "./project.service";

/**
 * Ensures there is a project at the target of the navigation.
 */
@Injectable({ providedIn: "root" })
export class ProjectExistsGuard implements CanActivate {
  /**
   * Requires an instance of the current project.
   */
  constructor(
    private _projectService: ProjectService,
    private _router: Router,
    private _flashService: FlashService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    const projectSlug = route.params["projectId"];
    console.log(`ProjectExistsGuard: "${projectSlug}" => ???`);

    // Possibly trigger loading the project
    this._projectService.setActiveProject(projectSlug, false);

    // And check whether it actually exists
    const toReturn = this._projectService.activeProject.pipe(
      first(),
      catchError((response: any) => {
        let message = `Unknown Error: ${JSON.stringify(response)}`;

        if (response instanceof Response) {
          message = `Server responded "${response.status}: ${response.statusText}"`;
        } else if (response instanceof Error) {
          message = `Error: ${response.message}`;
        }

        this._flashService.addMessage({
          caption: `Project with slug "${projectSlug}" couldn't be loaded!`,
          text: message,
          type: "danger",
        });

        this._router.navigate(["/about/projects"]);

        return of(undefined);
      }),
      map((project) => !!project),
      tap((res) =>
        console.log(`ProjectExistsGuard: "${projectSlug}" => ${res}`)
      )
    );

    return toReturn;
  }
}
