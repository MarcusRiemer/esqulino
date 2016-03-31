import 'rxjs/Rx'

import {Injectable}                              from 'angular2/core'
import {Http, Response, Headers, RequestOptions} from 'angular2/http'

import {ReplaySubject}                           from 'rxjs/subject/ReplaySubject'
import {Observable}                              from 'rxjs/Observable'
import {Observer}                                from 'rxjs/Observer'

import {ProjectDescription}     from '../shared/project.description'
import {Model}                  from '../shared/query'
import {QueryResult, RawResult} from '../shared/result'


import {Project}            from './project'

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
     * The project instance that is currently delivered to all
     * subscribers.
     */
    private _cachedProject : Project;

    /**
     * Handed out to clients so they can subscribe to something.
     */
    private _observable : Observable<Project>;

    /**
     * Used to emit events to clients.
     */
    private _observer : Observer<Project>;
    
    /**
     * @param _http Dependently injected by Angular2
     */
    constructor(private _http: Http) {
        // Create observable and observer once and for all. These instances
        // are not allowed to changed as they are passed on to every subscriber.
        this._observable = Observable.create( (obs : Observer<Project>) => {
            this._observer = obs;
        });     
    }

    /**
     * @param id The id of the project to set for all subscribers
     */
    setActiveProject(id : string) {
        // Projects shouldn't change while other requests are in progress
        if (this._httpRequest) {
            throw { "err" : "HTTP request in progress" };
        }
        
        this._httpRequest = this._http.get('/api/project/' + id)
            .catch(this.handleError)
            .map(res => new Project(res.json()));

        this._httpRequest.subscribe(res => {
            // Cache the project
            this._cachedProject = res;
            // Show that there are no more requests
            this._httpRequest = null;
            // Inform subscribers
            this._observer.next(this._cachedProject)

            console.log("Got project");
        });
    }

    /**
     * Retrieves an observable that always points to the active
     * project.
     */
    get ActiveProject() : Observable<Project> {
        return (this._observable);
    }

    
    /**
     * Sends a certain query to the server to be executed.
     */
    runQuery(id : string) {
        const query = this._cachedProject.getQueryById(id);
        
        const url = '/api/project/' + this._cachedProject.id + '/query/' + id + '/run';
        
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const toReturn = this._http.post(url, "{}", options)
            .map( (res) => new QueryResult(query, <RawResult> res.json()))
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
            sql : string
        }

        const query = this._cachedProject.getQueryById(id);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = '/api/project/' + this._cachedProject.id + '/query/' + id;

        const bodyJson : QueryUpdate = {
            model : query.toModel(),
            sql : query.toSqlString()
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
        const url = `/api/project/${this._cachedProject.id}/query/create/${table}`;
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
