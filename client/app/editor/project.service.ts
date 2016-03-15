import 'rxjs/Rx';

import {Injectable}     from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {Observable}     from 'rxjs/Observable';

import {ProjectDescription} from '../shared/project.description'
import {Project}            from './project'

/**
 * Wraps access to a whole project.
 */
@Injectable()
export class ProjectService {
    // The project cache
    private cache : Project;

    // If a request is currently in progress, there is no need to fire
    // a second request.
    private in_progress : Promise<Project>;

    /**
     * @param _http Dependently injected
     */
    constructor(private _http: Http) { }

    /**
     * Immediatly retrieve cached projects or, if no projects are present,
     * fire up a requests for those projects.
     */
    getProject(id : string) : Observable<Project> {
        console.log(`Getting ${id}`);
        
        return this._http.get('/api/project/' + id)
            .do(res => console.log(res.json()))
            .map(res => new Project(res.json()))
            .catch(this.handleError);
        
    }

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
