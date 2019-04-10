import { Component } from '@angular/core'
import { Http, Response, RequestOptions, Headers } from '@angular/http'
import { Router } from '@angular/router'

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProjectCreationDescription, StringValidator } from '../shared/project.description'
import { ServerApiService } from '../shared'
import { CURRENT_API_VERSION } from '../shared/resource.description'

@Component({
  templateUrl: 'templates/create-project.html'
})
export class CreateProjectComponent {

  private _currentRequest: Observable<Response>

  private _currentError: any;

  /**
   * The definition that will be sent to the server.
   */
  public params: ProjectCreationDescription = {
    apiVersion: CURRENT_API_VERSION,
    slug: undefined,
    name: undefined,
    admin: {
      name: "user",
      password: "user",
    },
    dbType: "sqlite3",
    basedOn: undefined
  };

  public constructor(
    private _http: Http,
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

  get regExpUserName() {
    return (StringValidator.ProjectUserName);
  }

  get regExpUserPassword() {
    return (StringValidator.ProjectUserPassword);
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

      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      this._currentRequest = this._http.post(
        this._serverApi.createProjectUrl(),
        JSON.stringify(this.params),
        options
      );

      this._currentRequest
        .pipe(map(res => res.json() as { id: string }))
        .subscribe(
          res => {
            this._router.navigateByUrl(`/editor/${res.id}`);
            this._currentRequest = undefined;
          },
          err => {
            this._currentError = err;
            this._currentRequest = undefined;
          }
        );
    }
  }
}
