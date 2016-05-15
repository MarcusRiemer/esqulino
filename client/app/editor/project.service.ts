import {Injectable}                              from '@angular/core'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {BehaviorSubject}                         from 'rxjs/BehaviorSubject'
import {AsyncSubject}                            from 'rxjs/AsyncSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {ProjectDescription}                      from '../shared/project.description'
import {
    Model, Query, QuerySelect, QueryDelete, QueryInsert, QueryUpdateRequestDescription,
} from '../shared/query'
import {
    QueryResult, QueryRunErrorDescription
} from '../shared/query.result'

import {Project}                                 from './project'

/**
 * Wraps access to a single project, which is deemed to be "active"
 * and should be displayed in the editor view.
 */
@Injectable()
export class ProjectService {

    /**
     * If a HTTP request is in progress, this is it.
     */
    private _httpRequest : Observable<Project>;

    /**
     * The project instance that is delivered to all subscribers.
     */
    private _subject : BehaviorSubject<Project>;
    
    /**
     * @param _http Dependently injected by Angular2
     */
    constructor(
        private _http : Http,
        private _server : ServerApiService
    ) {
        // Create a single subject once and for all. This instanc is not
        // allowed to changed as it is passed on to every subscriber.
        this._subject = new BehaviorSubject<Project>(null);
    }

    /**
     * @param id The id of the project to set for all subscribers
     */
    setActiveProject(id : string) {
        // Projects shouldn't change while other requests are in progress
        if (this._httpRequest) {
            throw { "err" : "HTTP request in progress" };
        }
        
        this._httpRequest = this._http.get(this._server.getProjectUrl(id))
            .catch(this.handleError)
            .map(res => new Project(res.json()));

        this._httpRequest.subscribe(res => {
            // Show that there are no more requests
            this._httpRequest = null;
            // Inform subscribers
            this._subject.next(res)

            console.log("Got project");
        });
    }

    /**
     * Retrieves an observable that always points to the active
     * project.
     */
    get activeProject() : Observable<Project> {
        return (this._subject);
    }

    /**
     * Unwraps the project from the observable.
     *
     * @return The project that is currently shared to all subscribers.
     */
    private get cachedProject() : Project {
        return (this._subject.getValue())
    }

    /**
     * Stores the description of the given project on the server. This will
     * not store any queries or pages, just the user facing description.
     *
     * @param proj The project with the relevant description.
     */
    storeProjectDescription(proj : Project) {
        const desc = proj.toModel();
        const url = this._server.getProjectUrl(proj.id);

        const toReturn = this._http.post(url, JSON.stringify(desc))
            .catch(this.handleError);

        return (toReturn);
    }

    /**
     * Creates a new page with the given name.
     */
    createPage(name : string) {
        const url = this._server.getPageUrl(this.cachedProject.id);
    }

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
