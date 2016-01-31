import {Component, OnInit}              from 'angular2/core';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {RouteConfig, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

import {SchemaComponent} from './schema.component';
import {Project}         from './project';
import {ProjectService}  from './project.service';

@Component({
    templateUrl: 'app/editor/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ProjectService]
})
@RouteConfig([
    { path: '/', name : "Schema", component : SchemaComponent, useAsDefault: true },
])
export class EditorComponent implements OnInit {
    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _routeParams: RouteParams
    ) { }

    /**
     * Load the project for all sub-components.
     */
    ngOnInit() {
        var projectId = this._routeParams.get('id');
        this._projectService.fetchProject(projectId)
            .then(project => this.project = project);
    }
}
