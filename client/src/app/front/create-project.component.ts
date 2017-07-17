import { Component, OnInit } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Router } from '@angular/router'

import { Observable } from 'rxjs/Observable'

import { ProjectCreationDescription } from '../shared/project.description'
import { ServerApiService } from '../shared/serverapi.service'
import { CURRENT_API_VERSION } from '../shared/resource.description'

@Component({
  templateUrl: 'templates/create-project.html'
})
export class CreateProjectComponent {

  private _currentRequest: Observable<Response>

  private _currentError: any;

  public myString: string = "Haha";

  public params: ProjectCreationDescription = {
    apiVersion: CURRENT_API_VERSION,
    id: undefined,
    name: undefined,
    admin: {
      name: undefined,
      password: ""
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

      this._currentRequest = this._http.post(this._serverApi.createProjectUrl(), JSON.stringify(this.params));
      this._currentRequest
        .map(res => res.json() as { id: string })
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
