import {Component, OnInit}              from 'angular2/core';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {ProjectDescriptionService} from './project.description.service';
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
}
