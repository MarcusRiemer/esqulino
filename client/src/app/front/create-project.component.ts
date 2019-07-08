import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'

import { Observable } from 'rxjs';

import { ProjectCreationDescription, StringValidator, ProjectDescription } from '../shared/project.description'
import { ServerApiService } from '../shared'

@Component({
  templateUrl: 'templates/create-project.html'
})
export class CreateProjectComponent {

  private _currentRequest: Observable<ProjectDescription>

  private _currentError: any;

  /**
   * The definition that will be sent to the server.
   */
  public params: ProjectCreationDescription = {
    slug: undefined,
    name: undefined,
  };

  public constructor(
    private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _router: Router
  ) {
  }

  get regExpSlug() {
    return (StringValidator.ProjectSlug);
  }

  get regExpName() {
    return (StringValidator.ProjectName);
  }

  get currentError() {
    return (this._currentError);
  }

  get inProgress(): boolean {
    return (!!this._currentRequest);
  }

  /**
   * Sends the current state of the the request to the server.
   */
  createProject() {
    if (!this._currentRequest) {
      this._currentError = undefined;

      this._currentRequest = this._http.post<ProjectDescription>(
        this._serverApi.createProjectUrl(), this.params
      );

      this._currentRequest
        .subscribe(
          res => {
            this._router.navigateByUrl(`/editor/${res.id}`);
            this._currentRequest = undefined;
          },
          err => {
            this._currentError = JSON.stringify(err);
            this._currentRequest = undefined;
          }
        );
    }
  }
}
