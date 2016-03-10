import 'rxjs/Rx';

import {Injectable}     from 'angular2/core';
import {Http, Response} from 'angular2/http';

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
    getProject(id : string) : Promise<Project> {
        // First stop: A cached result
        if (this.cache) {            
            return Promise.resolve(this.cache);
        }
        // Second stop: A request that is currently in progress
        else if (this.in_progress) {
            return this.in_progress;
        }
        // Third stop: A new request
        else {
            return this.fetchProject(id)
        }
    }

    /**
     * Fetch a new set of projects and also place them in the cache.
     */
    fetchProject(id : string) : Promise<Project> {
        this.in_progress = this._http.get('/api/project/' + id)
            .map(res => new Project(res.json()))
            .toPromise();

        this.in_progress.then(res => {
            this.cache = res
            this.in_progress = null
        });

        return this.in_progress
    }
}
