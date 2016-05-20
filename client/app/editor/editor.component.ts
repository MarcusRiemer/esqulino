import {Component, OnInit}              from '@angular/core'
import {CORE_DIRECTIVES}                from '@angular/common'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {
    Router, Routes, RouteSegment, ROUTER_DIRECTIVES
} from '@angular/router'

import {TableDescription}               from '../shared/schema.description'

import {Project}                        from './project'
import {ProjectService}                 from './project.service'
import {QueryService}                   from './query.service'
import {ToolbarService}                 from './toolbar.service'
import {ToolbarComponent}               from './toolbar.component'
import {NavbarComponent}                from './navbar.component'
import {
    SidebarPlaceholderComponent, sidebarType
} from './sidebar-placeholder.component'
import {SettingsComponent}              from './settings.component'
import {SchemaComponent}                from './schema.component'

import {PageEditorComponent}            from './page/editor.component'
import {QueryEditorComponent}           from './query/editor.component'
import {DragService}                    from './query/drag.service'

@Component({
    templateUrl: 'app/editor/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES,
                 ToolbarComponent, NavbarComponent, SidebarPlaceholderComponent],
    providers: [HTTP_PROVIDERS, ProjectService, QueryService, DragService, ToolbarService]
})
@Routes([
    { path: '', component : SettingsComponent },
    { path: 'settings', component : SettingsComponent },
    { path: 'schema', component : SchemaComponent },
    { path: 'query/:queryId', component : QueryEditorComponent },
    { path: 'page/:pageId', component : PageEditorComponent },
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
        private _routeParams: RouteSegment,
        private _router : Router
    ) { }

    /**
     * Load the project for all sub-components.
     */
    ngOnInit() {
        var projectId = this._routeParams.getParam('projectId');

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
     * @return True, if the sidebar should be visible.
     */
    get isSidebarVisible() : boolean {
        return (sidebarType(this._router, this._routeParams) != "none");
    }

    /**
     * Read only access to currently edited project.
     */
    get project() {
        return (this._project);
    }
}
