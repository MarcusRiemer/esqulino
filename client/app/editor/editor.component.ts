import {Component, OnInit}              from '@angular/core'
import {CORE_DIRECTIVES}                from '@angular/common'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {RouteConfig, RouteParams,ROUTER_DIRECTIVES} from '@angular/router-deprecated'

import {TableDescription}                from '../shared/schema.description'

import {Project}              from './project'
import {ProjectService}       from './project.service'
import {QueryService}         from './query.service'
import {ToolbarService}       from './toolbar.service'
import {NavbarComponent}      from './navbar.component'
import {ToolbarComponent}     from './toolbar.component'

import {SettingsComponent}    from './settings.component'
import {SchemaComponent}      from './schema.component'
import {PageEditorComponent}  from './page/editor.component'
import {QueryEditorComponent} from './query/editor.component'
@Component({
    templateUrl: 'app/editor/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, ToolbarComponent, NavbarComponent],
    providers: [HTTP_PROVIDERS, ProjectService, QueryService, ToolbarService]
})
@RouteConfig([
    { path: '/schema', name : "Schema",   component : SchemaComponent, useAsDefault: true },
    { path: '/settings', name : "Settings", component : SettingsComponent },
    { path: '/query/:queryId', name : "Query", component : QueryEditorComponent },
    { path: '/page/:pageId', name : "Page", component : PageEditorComponent },
])
export class EditorComponent implements OnInit {
    /**
     * The currently edited project
     */
    private _project : Project = null;

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
        var projectId = this._routeParams.get('projectId');

        console.log(`Loading project with id "${projectId}"`);

        this._projectService.setActiveProject(projectId);
        this._projectService.activeProject.subscribe(
            res => this._project = res
        );
    }

    /**
     * All currently available queries, but possibly an empty list.
     * Using this property ensures that the template does not throw
     * any null pointer exceptions.
     *
     * @return A possibly empty list of queries
     */
    get availableQueries() {
        if (this._project) {
            return (this._project.queries);
        } else {
            return ([]);
        }
    }

    /**
     * Read only access to currently edited project.
     */
    get project() {
        return (this._project);
    }
}
