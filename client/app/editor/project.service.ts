import 'rxjs/Rx'

import {Injectable}                              from 'angular2/core'
import {Http, Response, Headers, RequestOptions} from 'angular2/http'

import {BehaviorSubject}                         from 'rxjs/subject/BehaviorSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {ProjectDescription}                      from '../shared/project.description'
import {
    Model, QuerySelect, QueryDelete, QueryUpdateRequestDescription
} from '../shared/query'
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
     * Request to save a certain query.
     */
    saveQuery(id : string) {
        const query = this.cachedProject.getQueryById(id);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = this._server.getQuerySpecificUrl(this.cachedProject.id, id);

        let bodyJson : QueryUpdateRequestDescription = {
            model : query.toModel()
        }

        // Add the SQL representation, if applicable
        if (query.validate) {
            bodyJson.sql = query.toSqlString();
        }

        // Id is part of the URL
        delete bodyJson.model.id;

        const body = JSON.stringify(bodyJson);

        const toReturn = this._http.post(url, body, options)
            .map( (res) => "" )
            .catch(this.handleError);

        return (toReturn);
    }

    /**
     * Request to create a new query on the given table.
     *
     * @param table The name of the table to query initially
     */
    createQuery(table : string) {
        const url = this._server.getQueryUrl(this.cachedProject.id);

        let model : Model.Query = {
            id : null,
            name : table,
            select : {
                columns : [{
                    expr : {
                        star : { }
                    }
                }]
            },
            from : {
                first : {
                    name : table
                }
            }
        }

        const query = new QuerySelect(this.cachedProject.schema, model);
        
        let bodyJson : QueryUpdateRequestDescription = {
            model : model,
            sql : query.toSqlString()
        }
        
        const toReturn = this._http.post(url, JSON.stringify(bodyJson))
            .catch(this.handleError);

        // Once the query has been created, add it to the list of queries
        // that are part of this project.
        toReturn.subscribe( queryId => {
                console.log("onNext");
                model.id = queryId.text();
                this.cachedProject.queries.push(new QuerySelect(this.cachedProject.schema, model));
            });

        return (toReturn.toPromise());
    }

    deleteQuery(queryId : string) {
        const url = this._server.getQuerySpecificUrl(this.cachedProject.id, queryId);

        const toReturn = this._http.delete(url)
            .catch(this.handleError);

        toReturn.subscribe( res => {
            this.cachedProject.removeQueryById(queryId);
        });
    }

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
