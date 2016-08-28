import {Injectable}                       from '@angular/core'
import {CanActivate, Router,
        ActivatedRouteSnapshot,
        RouterStateSnapshot}              from '@angular/router'
import {Response}                         from '@angular/http'

import {Observable}                       from 'rxjs/Observable'

import {FlashService}                     from '../shared/flash.service'

import {ProjectService, Project}          from './project.service'

/**
 * Ensures there is a project at the target of the navigation.
 */
@Injectable()
export class ProjectExistsGuard implements CanActivate {
    /**
     * Requires an instance of the current project.
     */
    constructor(private _projectService : ProjectService,
                private _router : Router,
                private _flashService : FlashService) {
        
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const projectId = route.params['projectId'];
        console.log(`ProjectExistsGuard: "${projectId}" => ???`);

        // Possibly trigger loading the project
        this._projectService.setActiveProject(projectId, false);

        // And check whether it actually exists
        const toReturn = this._projectService.activeProject
            .first()
            .catch( (response : Response) => {
                this._flashService.addMessage({
                    caption: `Project with id "${projectId}" couldn't be loaded!`,
                    text: `Server responded "${response.status}: ${response.statusText}"`,
                    type: "danger"
                });

                this._router.navigate(["/about/projects"]);
                
                return (Observable.of(undefined));
            })
            .map(project => !!project)
            .do(res => console.log(`ProjectExistsGuard: "${projectId}" => ${res}`));

        return (toReturn);
    }
}
