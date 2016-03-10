import 'rxjs/Rx';

import {Injectable}     from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {ProjectDescription} from './project.description'

/**
 * Wraps access to project descriptions.
 */
@Injectable()
export class ProjectDescriptionService {
    // The project cache
    private cache : ProjectDescription[];

    // If a request is currently in progress, there is no need to fire
    // a second request.
    private  in_progress : Promise<ProjectDescription[]>;

    /**
     * @param _http Dependently injected
     */
    constructor(private _http: Http) { }

    /**
     * Immediatly retrieve cached projects or, if no projects are present,
     * fire up a requests for those projects.
     */
    getProjects() : Promise<ProjectDescription[]> {
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
            return this.fetchProjects()
        }
    }

    /**
     * Fetch a new set of projects and also place them in the cache.
     */
    fetchProjects() : Promise<ProjectDescription[]> {
        this.in_progress = this._http.get('/api/project')
            .map(res => <ProjectDescription[]> res.json())
            .toPromise();

        this.in_progress.then(projects => {
            this.cache = projects
            this.in_progress = null
        });

        return this.in_progress
    }
}
