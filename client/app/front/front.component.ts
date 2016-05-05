import {Component, OnInit}              from '@angular/core';
import {HTTP_PROVIDERS}                 from '@angular/http';
import {CORE_DIRECTIVES}                from '@angular/common';
import {
    RouteConfig, ROUTER_DIRECTIVES
} from '@angular/router-deprecated';

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
}
