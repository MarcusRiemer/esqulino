import {Component, OnInit}              from 'angular2/core';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {RouteConfig, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

import {SettingsComponent}    from './settings.component';
import {SchemaComponent}      from './schema.component';
import {QueryEditorComponent} from './query.editor.component';
import {Project}              from './project';
import {ProjectService}       from './project.service';
import {Table}                from './table'

@Component({
    templateUrl: 'app/editor/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ProjectService]
})
@RouteConfig([
    { path: '/', name : "Schema",   component : SchemaComponent, useAsDefault: true },
    { path: '/settings', name : "Settings", component : SettingsComponent },
    { path: '/query', name : "Query", component : QueryEditorComponent },
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
        this._projectService.getProject(projectId)
            .then(res => this.project = res);
    }
}
