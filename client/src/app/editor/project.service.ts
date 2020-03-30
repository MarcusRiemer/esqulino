import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BehaviorSubject, Observable } from "rxjs";
import {
  catchError,
  delay,
  first,
  filter,
  tap,
  map,
  share,
} from "rxjs/operators";

import { ServerApiService } from "../shared/serverdata/serverapi.service";
import {
  Project,
  ProjectDescription,
  ProjectFullDescription,
} from "../shared/project";
import { ResourceReferencesService } from "../shared/resource-references.service";

export { Project, ProjectFullDescription };

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
  private _subject: BehaviorSubject<Project>;

  /**
   * @param _http To make HTTP requests
   * @param _server To know where the requests should go
   * @param _resourceReferences The currently available resources
   */
  constructor(
    private _http: HttpClient,
    private _server: ServerApiService,
    private _resourceReferences: ResourceReferencesService
  ) {
    // Create a single subject once and for all. This instance is not
    // allowed to changed as it is passed on to every subscriber.
    // TODO: Make this blocking until the first value was loaded
    //       instead of filling it with `undefined`.
    this._subject = new BehaviorSubject<Project>(undefined);
  }

  /**
   * Removes the reference to the current project, effectively
   * requiring a new project to be loaded.
   */
  forgetCurrentProject() {
    this._subject.next(undefined);
    console.log("Project Service: Told to forget current project");
  }

  /**
   * @param id The id of the project to set for all subscribers.
   * @param forceRefresh True, if the project should be reloaded if its already known.
   */
  setActiveProject(id: string, forceRefresh: boolean) {
    // Projects shouldn't change while other requests are in progress
    if (this._httpRequest) {
      throw { err: "HTTP request in progress" };
    }

    // Clear out the reference to the current project if we are loading
    // a new project or must reload by sheer force.
    const currentProject = this._subject.getValue();
    if (forceRefresh || (currentProject && currentProject.slug != id)) {
      this.forgetCurrentProject();
    }

    // Build the HTTP-request
    const url = this._server.getProjectUrl(id);
    this._httpRequest = this._http.get<ProjectFullDescription>(url).pipe(
      first(),
      map((res) => new Project(res, this._resourceReferences)),
      share() // Ensure that the request is not executed multiple times
    );

    // And execute it by subscribing to it.
    this._httpRequest.subscribe(
      (res) => {
        // There is a new project, Inform subscribers
        console.log(
          `Project Service: HTTP request for specific project ("${url}") finished`
        );
        this._subject.next(res);

        this._httpRequest = undefined;
      },
      (error: Response) => {
        if (error instanceof Error) {
          console.log(error);
        }

        // Something has gone wrong, pass the error on to the subscribers
        // of the project and hope they know what to do about it.
        console.log(
          `Project Service: HTTP error with request for specific project ("${url}") => "${error.status}: ${error.statusText}"`
        );
        this._subject.error(error);

        // Reset the internal to be as blank as possible
        this._subject = new BehaviorSubject<Project>(undefined);
        this._httpRequest = undefined;
      }
    );

    // Others may also be interested in the result
    return this._httpRequest;
  }

  /**
   * Retrieves an observable that always points to the active
   * project.
   */
  get activeProject(): Observable<Project> {
    return this._subject.pipe(filter((v) => !!v));
  }

  /**
   * Unwraps the project from the observable.
   *
   * @return The project that is currently shared to all subscribers.
   */
  get cachedProject(): Project {
    return this._subject.getValue();
  }

  /**
   * Stores the description of the given project on the server. This will
   * not store any queries or pages, just the user facing description.
   *
   * @param proj The project with the relevant description.
   */
  storeProjectDescription(proj: Project) {
    const desc = proj.toUpdateRequest();
    const url = this._server.getProjectUrl(proj.slug);

    const toReturn = this._http.put<ProjectDescription>(url, desc).pipe(
      catchError(this.passThroughError),
      delay(250),
      tap((desc) => proj.updateDescription(desc)),
      tap((_) => proj.markSaved())
    );

    return toReturn;
  }

  /**
   * Asks the server to delete the project with the given id.
   */
  deleteProject(projectId: string) {
    const url = this._server.getProjectUrl(projectId);
    return this._http.delete(url);
  }

  private passThroughError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.log(error);
    return Observable.throw(error);
  }
}
