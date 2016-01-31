import {Component, OnInit}              from 'angular2/core';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {AboutComponent}                               from './about.component';
import {ProjectListComponent, ProjectDetailComponent} from './project.component';
import {ProjectService}                               from './project.service';
import {Project}                                      from './project';

@Component({
    selector: 'sql-scratch',
    templateUrl: 'app/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, ProjectListComponent],
    providers: [HTTP_PROVIDERS, ProjectService]
})
@RouteConfig([
    { path: '/about',       name : "About",         component : AboutComponent },
    { path: '/project',     name : "ProjectList",   component : ProjectListComponent },
    { path: '/project/:id', name : "ProjectDetail", component : ProjectDetailComponent }
])
export class SqlScratchComponent implements OnInit {
    public title = 'SQL-Pad';
    public selectedProject : Project;

    constructor(private _projectService: ProjectService) { }

    ngOnInit() {
        this._projectService.fetchProjects()
    }
}
