import {Injectable}                              from '@angular/core'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {BehaviorSubject}                         from 'rxjs/BehaviorSubject'
import {AsyncSubject}                            from 'rxjs/AsyncSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {Page,PageDescription}                    from '../shared/page/index'

import {QueryParamsDescription}                  from './query.service'
import {Project}                                 from './project'

export {Page}

/**
 * Storing a page on the server
 */
export interface PageUpdateRequestDescription {
    /**
     * The backend model to store.
     */
    model : PageDescription

    /**
     * Serialized representations to store.
     */
    sources? : { [sourceType:string] : string }
}

/**
 * Fully self-contained request to render an arbitrary page. Because
 * the development state in the browser could differ significantly
 * from the state stored on the server this description specifies all
 * relevant data at once.
 */  
export interface PageRenderRequestDescription {
    sourceType : string,
    source : string,
    queries : {
        id : string,
        sql : string
    }[],
    params : QueryParamsDescription
}

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

    /**
     * Saves the given page
     * 
     * @param project The project the given page is part of
     * @param page The page to save
     *
     * @return An observable that resolves to the ID of the saved page
     */
    savePage(project : Project, page : Page) : Observable<string> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = this._server.getPageSpecificUrl(project.id, page.id);

        const bodyJson : PageUpdateRequestDescription  = {
            model : page.toModel(),
            sources : { }
        }

        // Store all rendered page representations
        bodyJson.sources[page.renderer.type] = page.renderer.renderPage(page);

        // Remove the ID from the model, the ID is part of the
        // request URL already.
        delete bodyJson.model.id;

        const body = JSON.stringify(bodyJson);

        const toReturn = this._http.post(url, body, options)
            .map( (res) => res.text() )
            .catch(this.handleError);

        return (toReturn);        
    }

    /**
     * Attempts to render the given page on the server
     */  
    renderPage(project : Project, page : Page) : Observable<string> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = this._server.getArbitraryRenderUrl(project.id);

        const fullQueries =
            // Retrieve the matching queries
            project.getQueriesById(page.referencedQueryIds)
            // And extract the (id,sql) "tuples"
            .map(q => { return {
                id : q.id,
                sql : q.toSqlString()
            } });
        
        const bodyJson : PageRenderRequestDescription  = {
            sourceType : page.renderer.type,
            source : page.renderer.renderPage(page),
            queries : fullQueries,
            params : {}
        }

        const toReturn = this._http.post(url, bodyJson, options)
            .map( (res) => res.text() )
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
