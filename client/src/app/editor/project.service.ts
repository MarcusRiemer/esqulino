import {Injectable}                              from '@angular/core'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {BehaviorSubject}                         from 'rxjs/BehaviorSubject'
import {AsyncSubject}                            from 'rxjs/AsyncSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {
    Project, ProjectDescription
} from '../shared/project'

import {
    Model, Query, SelectQueryResult, QueryRunErrorDescription
} from '../shared/query/index'

export {Project, ProjectDescription}

/**
 * Wraps access to a single project, which is deemed to be "active"
 * and should be displayed in the editor view.
 */
@Injectable()
export class ProjectService {

    /**
     * If a HTTP request is in progress, this is it.
     */
    private _httpRequest : Observable<Project>;

    /**
     * The project instance that is delivered to all subscribers.
     */
    private _subject : BehaviorSubject<Project>;
    
    /**
     * @param _http Dependently injected by Angular2
     */
    constructor(
        private _http : Http,
        private _server : ServerApiService
    ) {
        // Create a single subject once and for all. This instanc is not
        // allowed to changed as it is passed on to every subscriber.
        // TODO: Make this blocking until the first value was loaded
        //       instead of filling it with `undefined`.
        this._subject = new BehaviorSubject<Project>(undefined);
    }

    /**
     * Removes the reference to the current project, effectively
     * requiring a new project to be loaded.
     */
    forgetCurrentProject() {
        this._subject.next(undefined);
        console.log("Project Service: Told to forget current project");
    }

    /**
     * @param id The id of the project to set for all subscribers.
     * @param forceRefresh True, if the project should be reloaded if its already known.
     */
    setActiveProject(id : string, forceRefresh : boolean) {
        // Projects shouldn't change while other requests are in progress
        if (this._httpRequest) {
            throw { "err" : "HTTP request in progress" };
        }

        // Clear out the reference to the current project if we are loading
        // a new project or must reload by sheer force.
        const currentProject = this._subject.getValue();
        if (forceRefresh || (currentProject && currentProject.id != id)) {
            this.forgetCurrentProject();
        }

        // Build the HTTP-request
        const url = this._server.getProjectUrl(id);
        this._httpRequest = this._http.get(url)
            .map(res => new Project(res.json()));

        // And execute it by subscribing to it.
        const subscription = this._httpRequest
            .first()
            .subscribe(
                res => {                
                    // There is a new project, Inform subscribers
                    console.log(`Project Service: HTTP request for specific project ("${url}") finished`);
                    this._subject.next(res);

                    this._httpRequest = undefined
                },
                (error : Response) => {
                    if (error instanceof Error) {
                        console.log(error);
                    } 
                    
                    // Something has gone wrong, pass the error on to the subscribers
                    // of the project and hope they know what to do about it.
                    console.log(`Project Service: HTTP error with request for specific project ("${url}") => "${error.status}: ${error.statusText}"`);
                    this._subject.error(error);

                    this._subject = new BehaviorSubject<Project>(undefined);

                    this._httpRequest = undefined
                    
                }
            )
    }

    /**
     * Retrieves an observable that always points to the active
     * project.
     */
    get activeProject() : Observable<Project> {
        return (this._subject
                .filter(v => !!v));
    }

    /**
     * Unwraps the project from the observable.
     *
     * @return The project that is currently shared to all subscribers.
     */
    get cachedProject() : Project {
        return (this._subject.getValue())
    }

    /**
     * Stores the description of the given project on the server. This will
     * not store any queries or pages, just the user facing description.
     *
     * @param proj The project with the relevant description.
     */
    storeProjectDescription(proj : Project) {
        const desc = proj.toModel();
        const url = this._server.getProjectUrl(proj.id);

        const toReturn = this._http.post(url, JSON.stringify(desc))
            .do(_ => proj.markSaved())
            .catch(this.passThroughError);

        return (toReturn);
    }

    /**
     * Creates a new page with the given name.
     */
    createPage(name : string) {
        const url = this._server.getPageUrl(this.cachedProject.id);
    }

    private passThroughError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.log(error);
        return Observable.throw(error);
    }
}
