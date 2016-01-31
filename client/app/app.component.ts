import {Component, OnInit}              from 'angular2/core';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {EditorComponent}        from './editor/editor.component';

import {AboutComponent}         from './about.component';
import {ProjectListComponent}   from './project.list.component';
import {ProjectDetailComponent} from './project.detail.component';
import {ProjectService}         from './project.service';
import {Project}                from './project';

@Component({
    selector: 'sql-scratch',
    templateUrl: 'app/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, ProjectListComponent],
    providers: [HTTP_PROVIDERS, ProjectService]
})
@RouteConfig([
    { path: '/about',             name: "About",           component: AboutComponent,      useAsDefault: true },
    { path: '/project',           name: "ProjectList",     component: ProjectListComponent },
    { path: '/editor/:name/...',  name: "Editor",          component: EditorComponent },
])
export class SqlScratchComponent implements OnInit {
    public title = 'SQL-Pad';
    public selectedProject : Project;

    constructor(private _projectService: ProjectService) { }

    ngOnInit() {
        this._projectService.fetchProjects()
    }
}
