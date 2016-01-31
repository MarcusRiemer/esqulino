import {Component, OnInit}              from 'angular2/core';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {RouteConfig, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

import {SchemaComponent} from './schema.component';
import {Project}         from './project';
import {ProjectService}  from './project.service';

@Component({
    templateUrl: 'app/editor/templates/index.html',
    providers: [ProjectService],
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: '/schema', name : "Schema", component : SchemaComponent, useAsDefault: true },
])
export class EditorComponent implements OnInit {
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _routeParams: RouteParams
    ) { }

    ngOnInit() {
        var projectId = this._routeParams.get('id');
        this._projectService.fetchProject(projectId)
            .then(project => this.project = project);
    }
}
