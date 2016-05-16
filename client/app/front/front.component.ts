import {Component, OnInit}              from '@angular/core';
import {HTTP_PROVIDERS}                 from '@angular/http';
import {CORE_DIRECTIVES}                from '@angular/common';
import {
    Routes, ROUTER_DIRECTIVES
} from '@angular/router';

import {ProjectDescriptionService} from '../shared/project.description.service';
import {ProjectListComponent}      from './project.list.component';
import {AboutComponent}            from './about.component';

@Component({
    templateUrl: 'app/front/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ProjectDescriptionService]
})
@Routes([
    { path: 'projects', component: ProjectListComponent},
    { path: '',    component: AboutComponent},
])
export class FrontComponent {
}
