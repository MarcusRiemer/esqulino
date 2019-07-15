import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';

import { ServerApiService } from '../shared'
import { CodeResource } from '../shared/syntaxtree'
import { CodeResourceDescription } from '../shared/syntaxtree/coderesource.description';
import { Project } from '../shared/project'

@Injectable()
export class CodeResourceService {
  /**
   * @param _http Used to do HTTP requests
   * @param _server Used to figure out paths for HTTP requests
   */
  constructor(
    private _http: HttpClient,
    private _server: ServerApiService,
  ) {
  }

  /**
   * Asks the server to create a new block resource.
   */
  createCodeResource(project: Project, name: string, blockLanguageId: string, programmingLanguageId: string) {
    const url = this._server.getCodeResourceBaseUrl(project.slug);

    const body = {
      "name": name,
      "programmingLanguageId": programmingLanguageId,
      "blockLanguageId": blockLanguageId
    }

    const toReturn = this._http.post<CodeResourceDescription>(url, body)
      .pipe(
        catchError(this.handleError),
        delay(250),
        map(res => new CodeResource(res, project))
      );


    return (toReturn);
  }

  /**
   * Sends a updated code resource to the server
   */
  updateCodeResource(resource: CodeResource) {
    const url = this._server.getCodeResourceUrl(resource.project.slug, resource.id);

    // The actual document that should be sent
    const bodyJson = resource.toModel();

    // The actual document may not contain the ID (that's part of the URL)
    delete bodyJson.id;

    // If there is no ast present: Ensure that an empty AST is transferred
    if (resource.syntaxTreePeek.isEmpty) {
      bodyJson.ast = null;
    }

    const toReturn = this._http.put(url, bodyJson)
      .pipe(
        catchError(this.handleError),
        delay(250),
        tap(_ => resource.markSaved())
      );

    return (toReturn);
  }

  /**
   * Deletes the resource with the given ID from the server.
   */
  deleteCodeResource(resource: CodeResource) {
    const url = this._server.getCodeResourceUrl(resource.project.slug, resource.id);

    const toReturn = this._http.delete<void>(url)
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
