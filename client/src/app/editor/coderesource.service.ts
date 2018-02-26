import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'

import { Observable } from 'rxjs/Observable'

import { ServerApiService } from '../shared/serverapi.service'
import { CodeResource } from '../shared/syntaxtree'
import { Project } from '../shared/project'

@Injectable()
export class CodeResourceService {
  /**
   * @param _http Used to do HTTP requests
   * @param _server Used to figure out paths for HTTP requests
   */
  constructor(
    private _http: Http,
    private _server: ServerApiService
  ) {
  }

  /**
   * Asks the server to create a new block resource.
   */
  createCodeResource(project: Project, name: string, blockLanguageId: string, programmingLanguageId: string) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getCodeResourceBaseUrl(project.slug);

    const body = {
      "name": name,
      "programmingLanguageId": programmingLanguageId,
      "blockLanguageId": blockLanguageId
    }

    const toReturn = this._http.post(url, JSON.stringify(body), options)
      .catch(this.handleError)
      .delay(250)
      .map(res => new CodeResource(res.json(), project));


    return (toReturn);
  }

  /**
   * Sends a updated code resource to the server
   */
  updateCodeResource(resource: CodeResource) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getCodeResourceUrl(resource.project.slug, resource.id);

    const bodyJson = resource.toModel();
    delete bodyJson.id;

    const body = JSON.stringify(bodyJson);
    const toReturn = this._http.put(url, body, options)
      .delay(250)
      .map((res) => {
        const resourceId = res.text();
      })
      .catch(this.handleError);

    return (toReturn);
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error);
  }
}
