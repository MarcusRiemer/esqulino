import 'rxjs/Rx';

import {Injectable}     from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {Observable}     from 'rxjs/Observable';

import {ProjectDescription} from '../shared/project.description'
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

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
