import {Injectable}                       from '@angular/core'
import {CanActivate, Router,
        ActivatedRouteSnapshot,
        RouterStateSnapshot}              from '@angular/router'

import {ProjectService, Project}          from '../project.service'

/**
 * Ensures there is a page at the target of the navigation.
 */
@Injectable()
export class PageExistsGuard implements CanActivate {
    /**
     * Requires an instance of the current project.
     */
    constructor(private _projectService : ProjectService) {
        
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const pageId = route.params['pageId'];

        console.log(`PageExistsGuard: "${pageId}" => ???`);

        const toReturn = this._projectService.activeProject
            .filter(project => project != undefined)
            .first()
            .map(project => project.hasPageById(pageId))
            .do(res => console.log(`PageExistsGuard: "${pageId}" => ${res}`));

        return (toReturn);
    }
}
