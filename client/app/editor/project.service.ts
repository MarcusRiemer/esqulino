import 'rxjs/Rx'

import {Injectable}                              from 'angular2/core'
import {Http, Response, Headers, RequestOptions} from 'angular2/http'

import {BehaviorSubject}                         from 'rxjs/subject/BehaviorSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {ProjectDescription}                      from '../shared/project.description'
import {Model, QuerySelect, QueryDelete}         from '../shared/query'
import {QueryResult}                             from '../shared/query.result'

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
     * Sends a certain query to the server to be executed.
     */
    runQuery(id : string) {
        const query = this.cachedProject.getQueryById(id);        
        const url = this._server.getRunQueryUrl(this.cachedProject.id);
        
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const body = {
            sql : query.toSqlString(),
            params : { }
        }
        
        const toReturn = this._http.post(url, JSON.stringify(body), options)
            .map( (res) =>  {
                // The result changes dependending on the concrete type
                // of the query.
                if (query instanceof QuerySelect) {
                    return (new QueryResult(query, <any> res.json()))
                } else if (query instanceof QueryDelete) {
                    console.log(res.json);
                    return (null)
                }
            })
            .catch(this.handleError);

        return (toReturn);
    }
    
    /**
     * Saves a certain query
     */
    saveQuery(id : string) {
        // Over the wire format
        interface QueryUpdate {
            model : Model.Query,
            sql? : string
        }

        const query = this.cachedProject.getQueryById(id);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = this._server.getQueryUrl(this.cachedProject.id, query.id);

        let bodyJson : QueryUpdate = {
            model : query.toModel()
        }

        if (query.isComplete) {
            bodyJson.sql = query.toSqlString();
        }

        const body = JSON.stringify(bodyJson);

        const toReturn = this._http.post(url, body, options)
            .map( (res) => "" )
            .catch(this.handleError);

        return (toReturn);
    }

    /**
     * Creates a new query on the given table.
     */
    createQuery(table : string) {
        const url = `/api/project/${this.cachedProject.id}/query/create/${table}`;
        const body = "";
        
        const toReturn = this._http.post(url, body)
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
