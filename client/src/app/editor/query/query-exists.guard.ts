import {Injectable}                       from '@angular/core'
import {CanActivate, Router,
        ActivatedRouteSnapshot,
        RouterStateSnapshot}              from '@angular/router'

import {FlashService}                     from '../../shared/flash.service'

import {ProjectService, Project}          from '../project.service'

/**
 * Ensures there is a page at the target of the navigation.
 */
@Injectable()
export class QueryExistsGuard implements CanActivate {
    /**
     * Requires an instance of the current project.
     */
    constructor(private _projectService : ProjectService,
                private _router : Router,
                private _flashService : FlashService) {
        
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const queryId = route.params['queryId'];
        let projectId : string = undefined;

        console.log(`QueryExistsGuard: "${queryId}" => ???`);

        const toReturn = this._projectService.activeProject
            .first()
            .do( (project) => projectId = project.id)
            .map(project => project.hasQueryById(queryId))
            .do(res => {
                console.log(`QueryExistsGuard: "${queryId}" => ${res}`)

                if (!res) {
                    this._flashService.addMessage({
                        caption: `Query with id "${queryId}" couldn't be loaded!`,
                        text: `There is no query with this ID in the project.`,
                        type: "danger"
                    });

                    this._router.navigate(["/editor", projectId]);
                }
            });

        return (toReturn);
    }
}
