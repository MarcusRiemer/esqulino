import {Injectable}                              from '@angular/core'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {BehaviorSubject}                         from 'rxjs/BehaviorSubject'
import {AsyncSubject}                            from 'rxjs/AsyncSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {Page, PageUpdateRequestDescription}      from '../shared/page/index'

import {Project}                                 from './project'

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
        private _http : Http,
        private _server : ServerApiService
    ) {
    }

    savePage(project : Project, page : Page) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = this._server.getPageSpecificUrl(project.id, page.id);

        const bodyJson : PageUpdateRequestDescription  = {
            model : page.toModel(),
            sources : { }
        }

        // Store all rendered page representations
        bodyJson.sources[page.renderer.type] = page.renderer.renderPage(page);

        delete bodyJson.model.id;

        const body = JSON.stringify(bodyJson);

        const toReturn = this._http.post(url, body, options)
            .map( (res) => "" )
            .catch(this.handleError);

        return (toReturn);        
    }

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }

}
