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

    /**
     * @param _http Dependently injected
     */
    constructor(private _http: Http) { }

    /**
     * Immediatly retrieve cached projects or, if no projects are present,
     * fire up a requests for those projects.
     */
    getProjects() : Promise<Project[]> {
        if (this.cached_projects) {            
            return Promise.resolve(this.cached_projects);
        } else {
            return this.fetchProjects()
        }
    }

    /**
     * Fetch a new set of projects and also place them in the cache.
     */
    fetchProjects() : Promise<Project[]> {
        var promise = this._http.get('/project')
            .map(ProjectService.mapProject)
            .toPromise();

        promise.then(projects => this.cached_projects = projects);

        return promise
    }

    /**
     * Maps the given HTTP response to an array of projects
     */
    private static mapProject(res : Response) {
        var json : any[] = res.json();

        return json.map( item => new Project(item.name) )
    }
}
