import 'rxjs/Rx';

import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Project} from './project'

/**
 * Wraps access to projects
 */
@Injectable()
export class ProjectService {
    // The project cache
    private cached_projects : Project[];

    // If a request is currently in progress, there is no need to fire
    // a second request.
    private  in_progress :Promise<Project[]>;

    /**
     * @param _http Dependently injected
     */
    constructor(private _http: Http) { }

    /**
     * Immediatly retrieve cached projects or, if no projects are present,
     * fire up a requests for those projects.
     */
    getProjects() : Promise<Project[]> {
        // First stop: A cached result
        if (this.cached_projects) {            
            return Promise.resolve(this.cached_projects);
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
    fetchProjects() : Promise<Project[]> {
        this.in_progress = this._http.get('/project')
            .map(ProjectService.mapProject)
            .toPromise();

        this.in_progress.then(projects => {
            this.cached_projects = projects
            this.in_progress = null
        });

        return this.in_progress
    }

    /**
     * Maps the given HTTP response to an array of projects
     */
    private static mapProject(res : Response) {
        var json : any[] = res.json();

        return json.map( item => new Project(item.name) )
    }
}
