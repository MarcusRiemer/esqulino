import {Injectable}     from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {Project} from './project'

/**
 * Loads projects from the server
 */
@Injectable()
export class ProjectService {
    /**
     * @param _http Dependently injected
     */
    constructor(private _http: Http) { }

    /**
     * Fetch a project from the server
     */
    fetchProject(id : string) : Promise<Project> {
        return (this._http.get('/api/project/' + id)
                .map(res => new Project(res.json()))
                .toPromise());
    }
}
