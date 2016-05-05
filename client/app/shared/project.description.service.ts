import 'rxjs/Rx';

import {BehaviorSubject}    from 'rxjs/BehaviorSubject'
import {Observable}         from 'rxjs/Observable'

import {Injectable}         from '@angular/core';
import {Http, Response}     from '@angular/http';

import {ServerApiService}   from './serverapi.service'
import {ProjectDescription} from './project.description'

/**
 * Wraps access to project descriptions.
 */
@Injectable()
export class ProjectDescriptionService {
    /**
     * If a HTTP request is in progress, this is it.
     */
    private _httpRequest : Observable<ProjectDescription[]>;

    // The project cache
    private _cache : BehaviorSubject<ProjectDescription[]>;

    /**
     * @param _http Dependently injected
     */
    constructor(
        private _http : Http,
        private _serverApi : ServerApiService) {
        this._cache = new BehaviorSubject<ProjectDescription[]>([]);
    }

    /**
     * Immediatly retrieve cached projects or, if no projects are present,
     * fire up a requests for those projects.
     */
    getProjects() : Observable<ProjectDescription[]> {
        return (this._cache);
    }

    /**
     * Fetch a new set of projects and also place them in the cache.
     */
    fetchProjects() : Observable<ProjectDescription[]> {
        const uri = this._serverApi.getProjectListUrl();
        this._httpRequest = this._http.get(uri)
            .map(res => <ProjectDescription[]> res.json());

        this._httpRequest.subscribe(projects => {
            this._cache.next(projects)
            this._httpRequest = null
        });

        return (this._cache);
    }
}
