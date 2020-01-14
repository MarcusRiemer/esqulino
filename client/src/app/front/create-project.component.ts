import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { ProjectCreationRequest, StringValidator, ProjectCreationResponse } from '../shared/project.description'
import { ServerApiService } from '../shared'

@Component({
  templateUrl: 'templates/create-project.html'
})
export class CreateProjectComponent {

  private _currentRequest: Observable<ProjectCreationResponse>

  private _currentError: any;

  /**
   * The definition that will be sent to the server.
   */
  public params: ProjectCreationRequest = {
    slug: undefined,
    name: undefined,
  };

  public constructor(
    private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _router: Router
  ) {
  }

  // Defines how a valid slug could look like
  readonly regExpSlug = StringValidator.ProjectSlug;

  // Defines how a valid project name would look like
  readonly regExpName = StringValidator.ProjectName;


  get currentError() {
    return (this._currentError);
  }

  get inProgress(): boolean {
    return (!!this._currentRequest);
  }

  /**
   * Sends the current state of the the request to the server.
   */
  async createProject() {
    if (!this._currentRequest) {
      this._currentError = undefined;

      this._currentRequest = this._http.post<ProjectCreationResponse>(
        this._serverApi.createProjectUrl(), this.params
      ).pipe(first());

      try {
        const res = await this._currentRequest.toPromise();
        this._router.navigateByUrl(`/editor/${res.id}`);

        return res;
      } catch (err) {
        this._currentError = err.error;
      } finally {
        this._currentRequest = undefined;
      }
    } else {
      throw new Error("Another creation request is in progress");
    }
  }
}
