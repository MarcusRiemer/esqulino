import 'rxjs/Rx';

import {Injectable}                              from 'angular2/core';
import {Http, Response, Headers, RequestOptions} from 'angular2/http';

import {Observable}             from 'rxjs/Observable';

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
    private inProgress : Observable<Project>;

    private cachedProject : Project;
    
    /**
     * @param _http Dependently injected by Angular2
     */
    constructor(private _http: Http) { }

    /**
     * @param id The id of the project to retrieve
     * @return An observable that updates itself if the selected project changes.
     */
    setActiveProject(id : string) : Observable<Project> {
        if (this.inProgress) {
            return this.inProgress;
        } else if (this.cachedProject) {
            return Observable.of(this.cachedProject);
        } else {
            this.inProgress = this._http.get('/api/project/' + id)
                .map(res => new Project(res.json()))
                .do(res => {
                    this.cachedProject = res;
                    this.inProgress = null;
                })
                .catch(this.handleError);

            return (this.inProgress);
        }
    }

    get ActiveProject() : Observable<Project> {
        if (this.inProgress) {
            return this.inProgress;
        } else if (this.cachedProject) {
            return Observable.of(this.cachedProject);
        } else {
            throw { error : "No active project known" };
        }
    }

    
    /**
     * Sends a certain query to the server to be executed.
     */
    runQuery(id : string) {
        const query = this.cachedProject.getQueryById(id);
        
        const url = '/api/project/' + this.cachedProject.id + '/query/' + id + '/run';
        
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

        const query = this.cachedProject.getQueryById(id);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = '/api/project/' + this.cachedProject.id + '/query/' + id;

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

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
