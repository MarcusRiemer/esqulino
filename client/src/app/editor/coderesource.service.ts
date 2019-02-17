import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'

import { Observable } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';

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
      .pipe(
        catchError(this.handleError),
        delay(250),
        map(res => new CodeResource(res.json(), project))
      );


    return (toReturn);
  }

  /**
   * Sends a updated code resource to the server
   */
  updateCodeResource(resource: CodeResource) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getCodeResourceUrl(resource.project.slug, resource.id);

    // The actual document that should be sent
    const bodyJson = resource.toModel();

    // The actual document may not contain the ID (that's part of the URL)
    delete bodyJson.id;

    // If there is no ast present: Ensure that an empty AST is transferred
    if (resource.syntaxTreePeek.isEmpty) {
      bodyJson.ast = null;
    }

    const body = JSON.stringify(bodyJson);
    const toReturn = this._http.put(url, body, options)
      .pipe(
        catchError(this.handleError),
        delay(250)
      );

    return (toReturn);
  }

  /**
   * Deletes the resource with the given ID from the server.
   */
  deleteCodeResource(resource: CodeResource) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getCodeResourceUrl(resource.project.slug, resource.id);

    const toReturn = this._http.delete(url, options)
      .pipe(
        catchError(this.handleError),
        delay(250)
      );

    return (toReturn);
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error);
  }
}
