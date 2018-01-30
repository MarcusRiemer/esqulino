import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { Observable } from 'rxjs/Observable'

import { ServerApiService } from '../shared/serverapi.service'
import { KeyValuePairs, encodeUriParameters } from '../shared/util'
import {
  Page, PageDescription, Body, CURRENT_API_VERSION
} from '../shared/page/index'

import { Project } from './project.service'
import { QueryParamsDescription } from './query.service.description'
import { PageRenderRequestDescription, PageUpdateRequestDescription } from './page.service.description'

export { Page }

/**
 * Provides means to communicate with a server that can store or run
 * pages.
 */
@Injectable()
export class PageService {
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
   * Saves the given page
   * 
   * @param project The project the given page is part of
   * @param page The page to save
   *
   * @return An observable that resolves to the ID of the saved page
   */
  savePage(project: Project, page: Page): Observable<Page> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getPageSpecificUrl(project.slug, page.id);

    const bodyJson: PageUpdateRequestDescription = {
      model: page.toModel(),
      sources: {}
    }

    // Store all rendered page representations
    bodyJson.sources[page.renderer.type] = page.renderer.renderPage(page);

    // Remove the ID from the model, the ID is part of the
    // request URL already.
    delete bodyJson.model.id;

    const body = JSON.stringify(bodyJson);

    const toReturn = this._http.post(url, body, options)
      .map((res) => {
        const pageId = res.text();

        // Possibly create the newly created page as part of the project model
        // on the client.
        if (!project.hasPage(pageId)) {
          // Mutating an ID is not possible, so we create a new page that
          // is identical except for the id
          const pageModel = page.toModel();
          pageModel.id = pageId;
          const newPage = new Page(pageModel, project);

          // Make it part of the project
          project.addPage(newPage);

          // And return the new page
          return (newPage);
        } else {
          // No new page, the old page will do fine. But it has been saved!
          page.markSaved();
          return (page);
        }
      })
      .catch(this.handleError);

    return (toReturn);
  }

  /**
   * Creates a new page
   *
   * @param project The project the given page is part of
   * @þaram name The name of the page to create
   */
  createPage(project: Project, name: string) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getPageUrl(project.slug);

    // A new named page with a single row
    const page = new Page({
      id: undefined,
      name: name,
      apiVersion: CURRENT_API_VERSION,
      referencedQueries: [],
      body: Body.emptyDescription
    }, project);

    return (this.savePage(project, page));
  }

  /**
   * Requests to delete a page.
   *
   * @param project The project the page belongs to.
   * @param queryId The id of the page to delete
   */
  deletePage(project: Project, pageId: string) {
    const url = this._server.getPageSpecificUrl(project.slug, pageId);

    const toReturn = this._http.delete(url)
      .catch(this.handleError);

    toReturn.subscribe(res => {
      project.removePageById(pageId);
    });
  }

  /**
   * Attempts to render the given page on the server
   */
  renderPage(project: Project,
    page: Page,
    pageParams?: KeyValuePairs)
    : Observable<string> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let url = this._server.getArbitraryRenderUrl(project.slug);

    // Append GET parameters
    if (pageParams) {
      url += "?" + encodeUriParameters(pageParams);
    }

    const fullQueries =
      // Retrieve the matching queries
      page.referencedQueries.map(ref => {
        return ({
          name: ref.name,
          sql: project.getQueryById(ref.queryId).toSqlString()
        })
      });

    const bodyJson: PageRenderRequestDescription = {
      sourceType: page.renderer.type,
      source: page.renderer.renderPage(page),
      page: page.toModel(),
      queries: fullQueries,
      params: {}
    }

    const toReturn = this._http.post(url, bodyJson, options)
      .map((res) => res.text())
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
