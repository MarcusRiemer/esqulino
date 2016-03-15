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
    // The same instance should be shared among all projects
    private cache : {
        observable : Observable<Project>,
        id : string
    };
    
    /**
     * @param _http Dependently injected by Angular2
     */
    constructor(private _http: Http) { }

    /**
     * @param id The id of the project to retrieve
     * @return An observable that updates itself if the selected project changes.
     */
    getProject(id : string) : Observable<Project> {
        // TODO: Actually cache the result, this seems to fire up a new request every time.
        
        if (!this.cache || this.cache.id != id) {
            let obs = this._http.get('/api/project/' + id)
                .do(res => console.log(res.json()))
                .map(res => new Project(res.json()))
                .catch(this.handleError);
                    
            this.cache = {
                observable : obs,
                id : id
            }
        }
        
        
        return this.cache.observable.share();
        
    }

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
