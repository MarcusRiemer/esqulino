import {Component, OnInit}              from 'angular2/core';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {RouteConfig, ROUTER_DIRECTIVES, Location} from 'angular2/router';

import {ProjectDescriptionService} from '../shared/project.description.service';
import {ProjectListComponent}      from './project.list.component';
import {AboutComponent}            from './about.component';

@Component({
    templateUrl: 'app/front/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ProjectDescriptionService]
})
@RouteConfig([
    { path: '/',        name: "About",       component: AboutComponent, useAsDefault: true},
    { path: '/project', name: "ProjectList", component: ProjectListComponent},
])
export class FrontComponent {

    constructor(private _location: Location) { }

    /**
     * Tests whether a certain path is currently visited.
     */
    isCurrentlyVisited(path : string) {
        if(path === this._location.path()){
            return true;
        }
        else if(path.length > 0){
            return this._location.path().indexOf(path) > -1;
        }
    }
    
}
