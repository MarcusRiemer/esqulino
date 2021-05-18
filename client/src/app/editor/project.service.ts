import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, delay, filter, tap, map, share } from "rxjs/operators";

import { Project, ProjectFullDescription } from "../shared/project";
import { ResourceReferencesService } from "../shared/resource-references.service";

import {
  FullProjectQuery,
  FullProjectGQL,
  DestroyProjectGQL,
  UpdateProjectGQL,
} from "../../generated/graphql";

export { Project, ProjectFullDescription };

export function fromGraphQL(
  descInQuery: FullProjectQuery
): ProjectFullDescription {
  return descInQuery.project;
}

/**
 * Wraps access to a single project, which is deemed to be "active"
 * and should be displayed in the editor view.
 */
@Injectable({ providedIn: "root" })
export class ProjectService {
  /**
   * If a HTTP request is in progress, this is it.
   */
  private _httpRequest: Observable<Project>;

  /**
   * The project instance that is delivered to all subscribers.
   */
  private readonly _currentProject = new BehaviorSubject<Project>(undefined);

  private readonly _currentProjectId = new BehaviorSubject<Project["id"]>(
    undefined
  );

  constructor(
    private _resourceReferences: ResourceReferencesService,
    private _fullProject: FullProjectGQL,
    private _destroyProject: DestroyProjectGQL,
    private _updateProject: UpdateProjectGQL
  ) {}

  /**
   * Removes the reference to the current project, effectively
   * requiring a new project to be loaded.
   */
  forgetCurrentProject() {
    console.log("ProjectService got told to forget current project");
    this._currentProject.next(undefined);
    this._currentProjectId.next(undefined);
  }

  /**
   * @param slugOrId The id of the project to set for all subscribers.
   * @param forceRefresh True, if the project should be reloaded if its already known.
   */
  async setActiveProject(slugOrId: string, forceRefresh: boolean) {
    // Projects shouldn't change while other requests are in progress
    if (this._httpRequest) {
      throw { err: "HTTP request in progress" };
    }

    // Clear out the reference to the current project if we are loading
    // a new project or must reload by sheer force.
    const currentProject = this._currentProject.getValue();
    if (
      forceRefresh ||
      (currentProject && !currentProject.hasSlugOrId(slugOrId))
    ) {
      this.forgetCurrentProject();
    }

    // Build the HTTP-request
    this._httpRequest = this._fullProject
      .fetch({ id: slugOrId }, { fetchPolicy: "network-only" })
      .pipe(
        map((graphQlDoc) => fromGraphQL(graphQlDoc.data)),
        map((res) => new Project(res, this._resourceReferences)),
        share() // Ensure that the request is not executed multiple times
      );

    // And execute it by subscribing to it.
    this._httpRequest.subscribe(
      (res) => {
        // There is a new project, Inform subscribers
        console.log(
          `Project Service: HTTP request for specific project ("${slugOrId}") finished`
        );
        this._currentProject.next(res);
        this._currentProjectId.next(slugOrId);

        this._httpRequest = undefined;
      },
      (error: Response) => {
        // Something has gone wrong, pass the error on to the subscribers
        // of the project and hope they know what to do about it.
        console.log(
          `Project Service: HTTP error with request for specific project ("${slugOrId}") => "${error.status}: ${error.statusText}"`
        );
        this._currentProject.error(error);

        // Reset the internal to be as blank as possible
        this._currentProject.next(undefined);
        this._currentProjectId.next(undefined);
        this._httpRequest = undefined;
      }
    );

    // Others may also be interested in the result
    return this._httpRequest.toPromise();
  }

  /**
   * Retrieves an observable that always points to the active
   * project.
   */
  readonly activeProject = this._currentProject.pipe(filter((v) => !!v));

  readonly activeProjectId$ = this._currentProjectId.asObservable();

  /**
   * Unwraps the project from the observable.
   *
   * @return The project that is currently shared to all subscribers.
   */
  get cachedProject(): Project {
    return this._currentProject.getValue();
  }

  /**
   * Stores the description of the given project on the server. This will
   * not store any queries or pages, just the user facing description.
   *
   * @param proj The project with the relevant description.
   */
  storeProjectDescription(proj: Project) {
    const toReturn = this._updateProject
      .mutate({
        id: proj.id,
        description: proj.description,
        name: proj.name,
        preview: proj.projectImageId,
      })
      .pipe(
        catchError(this.passThroughError),
        delay(250),
        tap((_) => proj.markSaved())
      );

    return toReturn;
  }

  /**
   * Asks the server to delete the project with the given id.
   */
  deleteProject(projectId: string) {
    return this._destroyProject.mutate({ id: projectId }).toPromise();
  }

  private passThroughError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.log(error);
    return throwError(error);
  }
}
